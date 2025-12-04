// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FHEVM Example: User Decryption Pattern
 *
 * Demonstrates:
 * - Client holds private decryption key
 * - Smart contract cannot decrypt user data
 * - Selective data reveal by user
 * - Privacy-preserving queries
 * - Personal data encryption
 *
 * chapter: user-decryption
 *
 * @author Zama FHEVM Examples
 */

import { FHE, euint32, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract UserDecryptionExample is SepoliaConfig {
    // Encrypted user data (only user can decrypt)
    struct PrivateData {
        euint32 encryptedCreditScore;
        euint32 encryptedIncome;
        ebool encryptedIsEmployed;
        euint32 encryptedAge;
        string encryptedMedicalRecord;
        uint256 timestamp;
    }

    // Encrypted health data
    struct HealthData {
        euint32 encryptedHeartRate;
        euint32 encryptedBloodPressure;
        euint32 encryptedWeight;
        ebool encryptedHasConditions;
        string encryptedNotes;
        uint256 timestamp;
    }

    // Encrypted financial data
    struct FinancialData {
        euint32 encryptedAccountBalance;
        euint32 encryptedCreditLimit;
        euint32 encryptedMonthlyExpenses;
        ebool encryptedHasCreditIssues;
        uint256 timestamp;
    }

    // Storage (all encrypted, contract cannot decrypt)
    mapping(address => PrivateData) private userData;
    mapping(address => HealthData) private healthData;
    mapping(address => FinancialData) private financialData;
    mapping(address => ebool) private dataExists;
    mapping(address => mapping(string => ebool)) private sharePermissions;

    // Events (no sensitive data in events)
    event DataStored(address indexed user, string dataType);
    event PermissionGranted(address indexed user, address indexed to, string dataType);
    event PermissionRevoked(address indexed user, address indexed to, string dataType);

    /**
     * Store private user data
     *
     * chapter: user-decryption
     *
     * User encrypts data client-side and stores it on-chain.
     * Only the user holds the decryption key.
     *
     * @param _encryptedCreditScore Encrypted credit score
     * @param _encryptedIncome Encrypted income
     * @param _encryptedIsEmployed Encrypted employment status
     * @param _encryptedAge Encrypted age
     * @param _encryptedMedicalRecord Encrypted medical record
     */
    function storePrivateData(
        euint32 _encryptedCreditScore,
        euint32 _encryptedIncome,
        ebool _encryptedIsEmployed,
        euint32 _encryptedAge,
        string calldata _encryptedMedicalRecord
    ) external {
        userData[msg.sender] = PrivateData({
            encryptedCreditScore: _encryptedCreditScore,
            encryptedIncome: _encryptedIncome,
            encryptedIsEmployed: _encryptedIsEmployed,
            encryptedAge: _encryptedAge,
            encryptedMedicalRecord: _encryptedMedicalRecord,
            timestamp: block.timestamp
        });

        // Grant access only to the owner
        FHE.allow(_encryptedCreditScore, msg.sender);
        FHE.allow(_encryptedIncome, msg.sender);
        FHE.allow(_encryptedIsEmployed, msg.sender);
        FHE.allow(_encryptedAge, msg.sender);
        // Note: String encryption is client-side only

        dataExists[msg.sender] = true;
        emit DataStored(msg.sender, "private");
    }

    /**
     * Store health data
     *
     * chapter: user-decryption
     *
     * Medical data that only the user can decrypt
     *
     * @param _encryptedHeartRate Encrypted heart rate
     * @param _encryptedBloodPressure Encrypted blood pressure
     * @param _encryptedWeight Encrypted weight
     * @param _encryptedHasConditions Encrypted medical conditions flag
     * @param _encryptedNotes Encrypted medical notes
     */
    function storeHealthData(
        euint32 _encryptedHeartRate,
        euint32 _encryptedBloodPressure,
        euint32 _encryptedWeight,
        ebool _encryptedHasConditions,
        string calldata _encryptedNotes
    ) external {
        healthData[msg.sender] = HealthData({
            encryptedHeartRate: _encryptedHeartRate,
            encryptedBloodPressure: _encryptedBloodPressure,
            encryptedWeight: _encryptedWeight,
            encryptedHasConditions: _encryptedHasConditions,
            encryptedNotes: _encryptedNotes,
            timestamp: block.timestamp
        });

        FHE.allow(_encryptedHeartRate, msg.sender);
        FHE.allow(_encryptedBloodPressure, msg.sender);
        FHE.allow(_encryptedWeight, msg.sender);
        FHE.allow(_encryptedHasConditions, msg.sender);

        emit DataStored(msg.sender, "health");
    }

    /**
     * Store financial data
     *
     * chapter: user-decryption
     *
     * Financial information that only the user can decrypt
     *
     * @param _encryptedAccountBalance Encrypted account balance
     * @param _encryptedCreditLimit Encrypted credit limit
     * @param _encryptedMonthlyExpenses Encrypted monthly expenses
     * @param _encryptedHasCreditIssues Encrypted credit issues flag
     */
    function storeFinancialData(
        euint32 _encryptedAccountBalance,
        euint32 _encryptedCreditLimit,
        euint32 _encryptedMonthlyExpenses,
        ebool _encryptedHasCreditIssues
    ) external {
        financialData[msg.sender] = FinancialData({
            encryptedAccountBalance: _encryptedAccountBalance,
            encryptedCreditLimit: _encryptedCreditLimit,
            encryptedMonthlyExpenses: _encryptedMonthlyExpenses,
            encryptedHasCreditIssues: _encryptedHasCreditIssues,
            timestamp: block.timestamp
        });

        FHE.allow(_encryptedAccountBalance, msg.sender);
        FHE.allow(_encryptedCreditLimit, msg.sender);
        FHE.allow(_encryptedMonthlyExpenses, msg.sender);
        FHE.allow(_encryptedHasCreditIssues, msg.sender);

        emit DataStored(msg.sender, "financial");
    }

    /**
     * Grant temporary access to specific data
     *
     * chapter: user-decryption
     *
     * User can grant temporary access to their encrypted data.
     * The authorized party can decrypt using user's permission.
     *
     * @param _to Address to grant access to
     * @param _dataType Type of data to share ("private", "health", "financial")
     */
    function grantAccess(address _to, string calldata _dataType) external {
        require(dataExists[msg.sender], "No data exists for user");

        // Grant temporary access to the data
        PrivateData storage userPrivateData = userData[msg.sender];
        HealthData storage userHealthData = healthData[msg.sender];
        FinancialData storage userFinancialData = financialData[msg.sender];

        if (keccak256(bytes(_dataType)) == keccak256(bytes("private"))) {
            FHE.allowTransient(userPrivateData.encryptedCreditScore, _to);
            FHE.allowTransient(userPrivateData.encryptedIncome, _to);
            FHE.allowTransient(userPrivateData.encryptedIsEmployed, _to);
            FHE.allowTransient(userPrivateData.encryptedAge, _to);
        } else if (keccak256(bytes(_dataType)) == keccak256(bytes("health"))) {
            FHE.allowTransient(userHealthData.encryptedHeartRate, _to);
            FHE.allowTransient(userHealthData.encryptedBloodPressure, _to);
            FHE.allowTransient(userHealthData.encryptedWeight, _to);
            FHE.allowTransient(userHealthData.encryptedHasConditions, _to);
        } else if (keccak256(bytes(_dataType)) == keccak256(bytes("financial"))) {
            FHE.allowTransient(userFinancialData.encryptedAccountBalance, _to);
            FHE.allowTransient(userFinancialData.encryptedCreditLimit, _to);
            FHE.allowTransient(userFinancialData.encryptedMonthlyExpenses, _to);
            FHE.allowTransient(userFinancialData.encryptedHasCreditIssues, _to);
        }

        sharePermissions[msg.sender][_dataType] = FHE.asEbool(true);
        emit PermissionGranted(msg.sender, _to, _dataType);
    }

    /**
     * Revoke access to user's data
     *
     * chapter: user-decryption
     *
     * Note: FHE doesn't support revocation natively.
     * This tracks permissions for UI purposes.
     *
     * @param _dataType Type of data to revoke access from
     */
    function revokeAccess(string calldata _dataType) external {
        sharePermissions[msg.sender][_dataType] = FHE.asEbool(false);
        emit PermissionRevoked(msg.sender, address(0), _dataType);
    }

    /**
     * User can retrieve their own encrypted data
     *
     * chapter: user-decryption
     *
     * Only the user can retrieve and decrypt their own data
     *
     * @return creditScore User's encrypted credit score
     * @return income User's encrypted income
     * @return isEmployed User's encrypted employment status
     * @return age User's encrypted age
     * @return timestamp When data was stored
     */
    function getMyPrivateData()
        external
        view
        returns (euint32, euint32, ebool, euint32, uint256)
    {
        require(dataExists[msg.sender], "No data exists for user");

        PrivateData storage data = userData[msg.sender];
        return (
            data.encryptedCreditScore,
            data.encryptedIncome,
            data.encryptedIsEmployed,
            data.encryptedAge,
            data.timestamp
        );
    }

    /**
     * Get encrypted health data (user only)
     *
     * chapter: user-decryption
     *
     * @return heartRate Encrypted heart rate
     * @return bloodPressure Encrypted blood pressure
     * @return weight Encrypted weight
     * @return hasConditions Encrypted conditions flag
     * @return timestamp When data was stored
     */
    function getMyHealthData()
        external
        view
        returns (euint32, euint32, euint32, ebool, uint256)
    {
        require(dataExists[msg.sender], "No data exists for user");

        HealthData storage data = healthData[msg.sender];
        return (
            data.encryptedHeartRate,
            data.encryptedBloodPressure,
            data.encryptedWeight,
            data.encryptedHasConditions,
            data.timestamp
        );
    }

    /**
     * Get encrypted financial data (user only)
     *
     * chapter: user-decryption
     *
     * @return accountBalance Encrypted balance
     * @return creditLimit Encrypted credit limit
     * @return monthlyExpenses Encrypted monthly expenses
     * @return hasCreditIssues Encrypted credit issues flag
     * @return timestamp When data was stored
     */
    function getMyFinancialData()
        external
        view
        returns (euint32, euint32, euint32, ebool, uint256)
    {
        require(dataExists[msg.sender], "No data exists for user");

        FinancialData storage data = financialData[msg.sender];
        return (
            data.encryptedAccountBalance,
            data.encryptedCreditLimit,
            data.encryptedMonthlyExpenses,
            data.encryptedHasCreditIssues,
            data.timestamp
        );
    }

    /**
     * Verify user's age meets minimum requirement
     *
     * chapter: user-decryption
     *
     * Demonstrates privacy-preserving verification.
     * User can prove age >= X without revealing exact age.
     *
     * @param _user Address to verify
     * @param _minimumAge Minimum age requirement
     * @return meetsRequirement Encrypted boolean result
     */
    function verifyMinimumAge(address _user, uint32 _minimumAge)
        external
        view
        returns (ebool)
    {
        require(dataExists[_user], "No data exists for user");

        euint32 userAge = userData[_user].encryptedAge;
        euint32 minAge = FHE.asEuint32(_minimumAge);

        return FHE.gte(userAge, minAge);
    }

    /**
     * Verify user's credit score meets minimum
     *
     * chapter: user-decryption
     *
     * Privacy-preserving credit verification
     *
     * @param _user Address to verify
     * @param _minimumScore Minimum credit score required
     * @return meetsRequirement Encrypted boolean result
     */
    function verifyCreditScore(address _user, uint32 _minimumScore)
        external
        view
        returns (ebool)
    {
        require(dataExists[_user], "No data exists for user");

        euint32 creditScore = userData[_user].encryptedCreditScore;
        euint32 minScore = FHE.asEuint32(_minimumScore);

        return FHE.gte(creditScore, minScore);
    }

    /**
     * Check if user has stored data
     *
     * chapter: user-decryption
     *
     * @param _user User address to check
     * @return hasData Whether user has stored data
     */
    function hasData(address _user) external view returns (bool) {
        return dataExists[_user];
    }

    /**
     * Get data storage timestamp
     *
     * chapter: user-decryption
     *
     * Non-sensitive metadata that can be public
     *
     * @param _user User address
     * @return timestamp When data was last stored
     */
    function getDataTimestamp(address _user) external view returns (uint256) {
        if (!dataExists[_user]) {
            return 0;
        }
        return userData[_user].timestamp;
    }

    /**
     * Compare user's income to threshold
     *
     * chapter: user-decryption
     *
     * User can check if income >= threshold without revealing exact income
     *
     * @param _threshold Income threshold to compare against
     * @return meetsThreshold Encrypted boolean result
     */
    function compareIncomeToThreshold(uint32 _threshold)
        external
        view
        returns (ebool)
    {
        require(dataExists[msg.sender], "No data exists for user");

        euint32 income = userData[msg.sender].encryptedIncome;
        euint32 threshold = FHE.asEuint32(_threshold);

        return FHE.gte(income, threshold);
    }

    /**
     * Check if user is employed (encrypted result)
     *
     * chapter: user-decryption
     *
     * @return isEmployed Encrypted employment status
     */
    function checkEmploymentStatus() external view returns (ebool) {
        require(dataExists[msg.sender], "No data exists for user");
        return userData[msg.sender].encryptedIsEmployed;
    }
}