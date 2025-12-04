// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FHEVM Example: Access Control Pattern
 *
 * Demonstrates:
 * - FHE.allow() - Grant permanent decryption access
 * - FHE.allowTransient() - Grant temporary decryption access
 * - Permission management with encrypted data
 * - Selective data visibility without revealing content
 *
 * chapter: access-control
 *
 * @author Zama FHEVM Examples
 */

import { FHE, euint32, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AccessControlExample is SepoliaConfig {
    address public admin;

    // Encrypted data structures with access controls
    struct EncryptedFile {
        euint32 encryptedContent;
        eaddress encryptedOwner;
        uint256 timestamp;
        bool isPublic;
    }

    // Storage
    mapping(uint256 => EncryptedFile) private files;
    mapping(uint256 => mapping(address => bool)) public accessGranted;
    mapping(uint256 => mapping(address => bool)) public temporaryAccess;

    // Counter for file IDs
    uint256 public fileCounter;

    // Events
    event FileUploaded(uint256 indexed fileId, address indexed owner);
    event AccessGranted(uint256 indexed fileId, address indexed user, bool permanent);
    event AccessRevoked(uint256 indexed fileId, address indexed user);

    constructor() {
        admin = msg.sender;
        fileCounter = 0;
    }

    /**
     * Upload encrypted file and grant permanent access to owner
     *
     * chapter: access-control
     *
     * Uses FHE.allow() to grant permanent decryption access to the file owner
     * The encrypted content cannot be decrypted by the contract or unauthorized users
     *
     * @param _encryptedContent Encrypted file content as euint32
     * @param _isPublic Whether file should be publicly decryptable
     * @return fileId The unique file identifier
     */
    function uploadFile(euint32 _encryptedContent, bool _isPublic) external returns (uint256) {
        fileCounter++;
        uint256 fileId = fileCounter;

        files[fileId] = EncryptedFile({
            encryptedContent: _encryptedContent,
            encryptedOwner: FHE.asEaddress(msg.sender),
            timestamp: block.timestamp,
            isPublic: _isPublic
        });

        // Grant permanent access to owner
        FHE.allow(_encryptedContent, msg.sender);
        accessGranted[fileId][msg.sender] = true;

        // If public, allow anyone to decrypt
        if (_isPublic) {
            FHE.allow(_encryptedContent, address(0)); // Allow public decryption
        }

        emit FileUploaded(fileId, msg.sender);
        return fileId;
    }

    /**
     * Grant temporary access to a file (single transaction)
     *
     * chapter: access-control
     *
     * Uses FHE.allowTransient() to grant temporary decryption access
     * The access is valid only for the current transaction
     *
     * @param _fileId The file to grant access to
     * @param _user Address to grant temporary access
     */
    function grantTemporaryAccess(uint256 _fileId, address _user) external {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");
        require(msg.sender == files[_fileId].encryptedOwner.decrypt() || msg.sender == admin,
               "Only owner or admin can grant access");

        euint32 content = files[_fileId].encryptedContent;
        FHE.allowTransient(content, _user);

        temporaryAccess[_fileId][_user] = true;
        emit AccessGranted(_fileId, _user, false);
    }

    /**
     * Grant permanent access to a file
     *
     * chapter: access-control
     *
     * Uses FHE.allow() to grant permanent decryption access
     * The user can decrypt the file anytime after this
     *
     * @param _fileId The file to grant access to
     * @param _user Address to grant permanent access
     */
    function grantPermanentAccess(uint256 _fileId, address _user) external {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");
        require(msg.sender == files[_fileId].encryptedOwner.decrypt() || msg.sender == admin,
               "Only owner or admin can grant access");

        euint32 content = files[_fileId].encryptedContent;
        FHE.allow(content, _user);

        accessGranted[_fileId][_user] = true;
        emit AccessGranted(_fileId, _user, true);
    }

    /**
     * Revoke permanent access to a file
     *
     * chapter: access-control
     *
     * Note: FHE doesn't support revocation natively, but we track permissions
     * The contract can prevent further operations based on our tracking
     *
     * @param _fileId The file to revoke access from
     * @param _user Address to revoke access from
     */
    function revokeAccess(uint256 _fileId, address _user) external {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");
        require(msg.sender == files[_fileId].encryptedOwner.decrypt() || msg.sender == admin,
               "Only owner or admin can revoke access");

        accessGranted[_fileId][_user] = false;
        temporaryAccess[_fileId][_user] = false;
        emit AccessRevoked(_fileId, _user);
    }

    /**
     * Retrieve encrypted file content (if access is granted)
     *
     * chapter: access-control
     *
     * Returns the encrypted content if the caller has access
     * The actual decryption happens client-side with the private key
     *
     * @param _fileId The file to retrieve
     * @return encryptedContent The encrypted file content
     */
    function getFileContent(uint256 _fileId) external view returns (euint32) {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");

        EncryptedFile storage file = files[_fileId];

        // Check access permissions
        require(
            file.isPublic || // Public file
            msg.sender == file.encryptedOwner.decrypt() || // Owner
            accessGranted[_fileId][msg.sender] || // Permanent access granted
            temporaryAccess[_fileId][msg.sender] || // Temporary access granted
            msg.sender == admin, // Admin access
            "Access denied"
        );

        return file.encryptedContent;
    }

    /**
     * Check if user has access to a file
     *
     * chapter: access-control
     *
     * Useful for UI to show access status without revealing file content
     *
     * @param _fileId The file to check
     * @param _user The user to check access for
     * @return hasAccess Whether the user has access
     */
    function hasAccess(uint256 _fileId, address _user) external view returns (bool) {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");

        EncryptedFile storage file = files[_fileId];

        return file.isPublic ||
               _user == file.encryptedOwner.decrypt() ||
               accessGranted[_fileId][_user] ||
               temporaryAccess[_fileId][_user] ||
               _user == admin;
    }

    /**
     * Get file metadata (non-encrypted information)
     *
     * chapter: access-control
     *
     * Returns public information about a file
     *
     * @param _fileId The file to get info for
     * @return owner The file owner
     * @return timestamp When the file was uploaded
     * @return isPublic Whether the file is public
     */
    function getFileMetadata(uint256 _fileId) external view returns (address, uint256, bool) {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");

        EncryptedFile storage file = files[_fileId];
        return (file.encryptedOwner.decrypt(), file.timestamp, file.isPublic);
    }

    /**
     * Upload a shared document with access list
     *
     * chapter: access-control
     *
     * Advanced pattern: Upload and grant access to multiple users at once
     *
     * @param _encryptedContent Encrypted content
     * @param _users List of users to grant access to
     * @return fileId The new file ID
     */
    function uploadSharedDocument(euint32 _encryptedContent, address[] calldata _users)
        external
        returns (uint256)
    {
        fileCounter++;
        uint256 fileId = fileCounter;

        files[fileId] = EncryptedFile({
            encryptedContent: _encryptedContent,
            encryptedOwner: FHE.asEaddress(msg.sender),
            timestamp: block.timestamp,
            isPublic: false
        });

        // Grant access to owner
        FHE.allow(_encryptedContent, msg.sender);
        accessGranted[fileId][msg.sender] = true;

        // Grant access to specified users
        for (uint256 i = 0; i < _users.length; i++) {
            FHE.allow(_encryptedContent, _users[i]);
            accessGranted[fileId][_users[i]] = true;
        }

        emit FileUploaded(fileId, msg.sender);
        return fileId;
    }

    /**
     * Batch grant access
     *
     * chapter: access-control
     *
     * Grant permanent access to multiple users at once
     *
     * @param _fileId The file to grant access to
     * @param _users List of users to grant access to
     */
    function batchGrantAccess(uint256 _fileId, address[] calldata _users) external {
        require(_fileId > 0 && _fileId <= fileCounter, "Invalid file ID");
        require(msg.sender == files[_fileId].encryptedOwner.decrypt() || msg.sender == admin,
               "Only owner or admin can grant access");

        euint32 content = files[_fileId].encryptedContent;

        for (uint256 i = 0; i < _users.length; i++) {
            FHE.allow(content, _users[i]);
            accessGranted[_fileId][_users[i]] = true;
            emit AccessGranted(_fileId, _users[i], true);
        }
    }
}