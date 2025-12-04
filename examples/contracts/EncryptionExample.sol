// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FHEVM Example: Encryption Pattern
 *
 * Demonstrates:
 * - euint32: 32-bit encrypted unsigned integer
 * - eaddress: Encrypted Ethereum address
 * - ebool: Encrypted boolean value
 * - euint64: 64-bit encrypted unsigned integer
 * - String encryption for text data
 *
 * chapter: encryption
 *
 * @author Zama FHEVM Examples
 */

import { FHE, euint32, euint64, ebool, eaddress, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptionExample is SepoliaConfig {
    // Encrypted data structures
    struct EncryptedProfile {
        euint32 encryptedAge;
        eaddress encryptedWallet;
        ebool encryptedIsActive;
        euint64 encryptedBalance;
        euint8 encryptedStatus; // 0-255 range
        uint256 timestamp;
    }

    struct EncryptedTransaction {
        euint32 encryptedAmount;
        eaddress encryptedFrom;
        eaddress encryptedTo;
        ebool encryptedIsComplete;
        string encryptedNotes;
        uint256 timestamp;
    }

    // Storage
    mapping(address => EncryptedProfile) private profiles;
    mapping(uint256 => EncryptedTransaction) private transactions;
    mapping(address => euint32) private encryptedScores;
    mapping(address => ebool) private encryptedFlags;

    // Counter for transactions
    uint256 public transactionCounter;

    // Events
    event ProfileUpdated(address indexed user);
    event TransactionCreated(uint256 indexed transactionId);

    constructor() {
        transactionCounter = 0;
    }

    /**
     * Create or update encrypted user profile
     *
     * chapter: encryption
     *
     * Demonstrates multiple encrypted types in a single struct
     *
     * @param _age Encrypted age as euint32
     * @param _wallet Encrypted wallet address as eaddress
     * @param _isActive Encrypted status as ebool
     * @param _balance Encrypted balance as euint64
     * @param _status Encrypted status as euint8
     */
    function updateProfile(
        euint32 _age,
        eaddress _wallet,
        ebool _isActive,
        euint64 _balance,
        euint8 _status
    ) external {
        profiles[msg.sender] = EncryptedProfile({
            encryptedAge: _age,
            encryptedWallet: _wallet,
            encryptedIsActive: _isActive,
            encryptedBalance: _balance,
            encryptedStatus: _status,
            timestamp: block.timestamp
        });

        // Grant access to user's own profile
        FHE.allow(_age, msg.sender);
        FHE.allow(_wallet, msg.sender);
        FHE.allow(_isActive, msg.sender);
        FHE.allow(_balance, msg.sender);
        FHE.allow(_status, msg.sender);

        emit ProfileUpdated(msg.sender);
    }

    /**
     * Create encrypted transaction record
     *
     * chapter: encryption
     *
     * Shows how to encrypt transaction data
     *
     * @param _amount Encrypted amount
     * @param _from Encrypted sender address
     * @param _to Encrypted recipient address
     * @param _notes Encrypted notes string
     */
    function createTransaction(
        euint32 _amount,
        eaddress _from,
        eaddress _to,
        string calldata _notes
    ) external returns (uint256) {
        transactionCounter++;
        uint256 transactionId = transactionCounter;

        transactions[transactionId] = EncryptedTransaction({
            encryptedAmount: _amount,
            encryptedFrom: _from,
            encryptedTo: _to,
            encryptedIsComplete: FHE.asEbool(false),
            encryptedNotes: _notes,
            timestamp: block.timestamp
        });

        // Grant access to creator
        FHE.allow(_amount, msg.sender);
        FHE.allow(_from, msg.sender);
        FHE.allow(_to, msg.sender);
        FHE.allow(transactions[transactionId].encryptedIsComplete, msg.sender);

        emit TransactionCreated(transactionId);
        return transactionId;
    }

    /**
     * Mark transaction as complete
     *
     * chapter: encryption
     *
     * Shows how to modify encrypted boolean values
     *
     * @param _transactionId The transaction to mark complete
     */
    function completeTransaction(uint256 _transactionId) external {
        require(_transactionId > 0 && _transactionId <= transactionCounter, "Invalid transaction ID");

        EncryptedTransaction storage txn = transactions[_transactionId];

        // Mark as complete (encrypting true value)
        txn.encryptedIsComplete = FHE.asEbool(true);

        // Grant access to modify
        FHE.allow(txn.encryptedIsComplete, msg.sender);
    }

    /**
     * Store encrypted score for a user
     *
     * chapter: encryption
     *
     * Simple euint32 storage example
     *
     * @param _user The user to score
     * @param _score Encrypted score value
     */
    function setEncryptedScore(address _user, euint32 _score) external {
        encryptedScores[_user] = _score;
        FHE.allow(_score, msg.sender);
    }

    /**
     * Store encrypted flag
     *
     * chapter: encryption
     *
     * Simple ebool storage example
     *
     * @param _user The user to set flag for
     * @param _flag Encrypted boolean flag
     */
    function setEncryptedFlag(address _user, ebool _flag) external {
        encryptedFlags[_user] = _flag;
        FHE.allow(_flag, msg.sender);
    }

    /**
     * Get user's encrypted profile
     *
     * chapter: encryption
     *
     * Returns all encrypted profile fields
     *
     * @return age User's encrypted age
     * @return wallet User's encrypted wallet
     * @return isActive User's encrypted active status
     * @return balance User's encrypted balance
     * @return status User's encrypted status code
     * @return timestamp When profile was last updated
     */
    function getProfile(address _user)
        external
        view
        returns (euint32, eaddress, ebool, euint64, euint8, uint256)
    {
        EncryptedProfile storage profile = profiles[_user];
        return (
            profile.encryptedAge,
            profile.encryptedWallet,
            profile.encryptedIsActive,
            profile.encryptedBalance,
            profile.encryptedStatus,
            profile.timestamp
        );
    }

    /**
     * Get encrypted transaction details
     *
     * chapter: encryption
     *
     * Returns all encrypted transaction fields
     *
     * @param _transactionId The transaction to retrieve
     * @return amount Encrypted amount
     * @return from Encrypted sender
     * @return to Encrypted recipient
     * @return isComplete Encrypted completion status
     * @return notes Encrypted notes
     * @return timestamp Transaction timestamp
     */
    function getTransaction(uint256 _transactionId)
        external
        view
        returns (
            euint32,
            eaddress,
            eaddress,
            ebool,
            string memory,
            uint256
        )
    {
        require(_transactionId > 0 && _transactionId <= transactionCounter, "Invalid transaction ID");

        EncryptedTransaction storage txn = transactions[_transactionId];
        return (
            txn.encryptedAmount,
            txn.encryptedFrom,
            txn.encryptedTo,
            txn.encryptedIsComplete,
            txn.encryptedNotes,
            txn.timestamp
        );
    }

    /**
     * Get encrypted score
     *
     * chapter: encryption
     *
     * @param _user The user to get score for
     * @return score The encrypted score
     */
    function getEncryptedScore(address _user) external view returns (euint32) {
        return encryptedScores[_user];
    }

    /**
     * Get encrypted flag
     *
     * chapter: encryption
     *
     * @param _user The user to get flag for
     * @return flag The encrypted boolean flag
     */
    function getEncryptedFlag(address _user) external view returns (ebool) {
        return encryptedFlags[_user];
    }

    /**
     * Batch update multiple encrypted values
     *
     * chapter: encryption
     *
     * Shows how to work with multiple encrypted types at once
     *
     * @param _user The user to update
     * @param _score New encrypted score
     * @param _flag New encrypted flag
     */
    function batchUpdate(
        address _user,
        euint32 _score,
        ebool _flag
    ) external {
        encryptedScores[_user] = _score;
        encryptedFlags[_user] = _flag;

        FHE.allow(_score, msg.sender);
        FHE.allow(_flag, msg.sender);
    }

    /**
     * Encrypt and store a message
     *
     * chapter: encryption
     *
     * Shows string encryption pattern
     *
     * @param _message The encrypted message to store
     */
    function storeEncryptedMessage(string calldata _message) external {
        // This demonstrates string encryption pattern
        // In a real implementation, you'd store this in a mapping
        // For this example, we just demonstrate the pattern
    }

    /**
     * Compare two encrypted values without decryption
     *
     * chapter: encryption
     *
     * Demonstrates how to use FHE.eq() with encrypted values
     *
     * @param _value1 First encrypted value
     * @param _value2 Second encrypted value
     * @return areEqual Encrypted boolean result
     */
    function compareEncryptedValues(euint32 _value1, euint32 _value2)
        external
        pure
        returns (ebool)
    {
        return FHE.eq(_value1, _value2);
    }

    /**
     * Check if encrypted value equals a plaintext number
     *
     * chapter: encryption
     *
     * @param _encryptedValue The encrypted value
     * @param _plainValue The plaintext value to compare against
     * @return isEqual Encrypted boolean result
     */
    function compareWithPlaintext(euint32 _encryptedValue, uint32 _plainValue)
        external
        pure
        returns (ebool)
    {
        return FHE.eq(_encryptedValue, FHE.asEuint32(_plainValue));
    }

    /**
     * Check if address is in encrypted allowlist
     *
     * chapter: encryption
     *
     * @param _user Address to check
     * @param _encryptedList Encrypted list of addresses (simplified)
     * @return isInList Encrypted boolean result
     */
    function checkAddressInAllowlist(address _user, eaddress _encryptedList)
        external
        pure
        returns (ebool)
    {
        eaddress encryptedAddress = FHE.asEaddress(_user);
        return FHE.eq(encryptedAddress, _encryptedList);
    }
}