// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FHEVM Example: Arithmetic Operations Pattern
 *
 * Demonstrates:
 * - FHE.add(a, b) - Addition on encrypted values
 * - FHE.sub(a, b) - Subtraction on encrypted values
 * - FHE.mul(a, b) - Multiplication on encrypted values
 * - FHE.div(a, b) - Division on encrypted values
 * - FHE.rem(a, b) - Remainder (modulo) operation
 * - FHE.min(a, b) - Minimum of two encrypted values
 * - FHE.max(a, b) - Maximum of two encrypted values
 *
 * chapter: arithmetic
 *
 * @author Zama FHEVM Examples
 */

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ArithmeticExample is SepoliaConfig {
    // Encrypted state variables
    euint32 public encryptedSum;
    euint32 public encryptedProduct;
    euint32 public encryptedBalance;
    euint64 public encryptedTotal;

    // User balances
    mapping(address => euint32) private encryptedBalances;
    mapping(address => euint64) private encryptedScores;

    // Counter for operations
    uint256 public operationCounter;

    // Events
    event CalculationPerformed(uint256 indexed operationId, string operation, uint256 result);
    event BalanceUpdated(address indexed user, uint256 newBalance);

    constructor() {
        operationCounter = 0;
        encryptedSum = FHE.asEuint32(0);
        encryptedProduct = FHE.asEuint32(1);
        encryptedBalance = FHE.asEuint32(0);
        encryptedTotal = FHE.asEuint64(0);
    }

    /**
     * Add two encrypted numbers
     *
     * chapter: arithmetic
     *
     * Demonstrates basic FHE addition
     *
     * @param _a First encrypted number
     * @param _b Second encrypted number
     * @return result Encrypted sum of a + b
     */
    function add(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.add(_a, _b);
    }

    /**
     * Subtract two encrypted numbers
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE subtraction
     *
     * @param _a Minuend (number to subtract from)
     * @param _b Subtrahend (number to subtract)
     * @return result Encrypted difference of a - b
     */
    function subtract(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.sub(_a, _b);
    }

    /**
     * Multiply two encrypted numbers
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE multiplication
     *
     * @param _a First encrypted number
     * @param _b Second encrypted number
     * @return result Encrypted product of a * b
     */
    function multiply(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.mul(_a, _b);
    }

    /**
     * Divide two encrypted numbers
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE division
     *
     * @param _a Dividend (number to divide)
     * @param _b Divisor (number to divide by)
     * @return result Encrypted quotient of a / b
     */
    function divide(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.div(_a, _b);
    }

    /**
     * Get remainder of division
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE modulo operation
     *
     * @param _a Number to divide
     * @param _b Divisor
     * @return result Encrypted remainder of a % b
     */
    function remainder(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.rem(_a, _b);
    }

    /**
     * Find minimum of two encrypted values
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE minimum operation
     *
     * @param _a First encrypted value
     * @param _b Second encrypted value
     * @return result Encrypted minimum of a and b
     */
    function minimum(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.min(_a, _b);
    }

    /**
     * Find maximum of two encrypted values
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE maximum operation
     *
     * @param _a First encrypted value
     * @param _b Second encrypted value
     * @return result Encrypted maximum of a and b
     */
    function maximum(euint32 _a, euint32 _b) external pure returns (euint32) {
        return FHE.max(_a, _b);
    }

    /**
     * Compare two encrypted values for equality
     *
     * chapter: arithmetic
     *
     * Demonstrates FHE equality comparison
     *
     * @param _a First encrypted value
     * @param _b Second encrypted value
     * @return result Encrypted boolean (true if equal)
     */
    function areEqual(euint32 _a, euint32 _b) external pure returns (ebool) {
        return FHE.eq(_a, _b);
    }

    /**
     * Add to global encrypted sum
     *
     * chapter: arithmetic
     *
     * Persistent encrypted accumulator pattern
     *
     * @param _value Value to add to global sum
     */
    function addToSum(euint32 _value) external {
        encryptedSum = FHE.add(encryptedSum, _value);

        operationCounter++;
        emit CalculationPerformed(operationCounter, "addToSum", 0); // Result is encrypted
    }

    /**
     * Add to global encrypted product
     *
     * chapter: arithmetic
     *
     * Persistent encrypted multiplication pattern
     *
     * @param _value Value to multiply with global product
     */
    function multiplyProduct(euint32 _value) external {
        encryptedProduct = FHE.mul(encryptedProduct, _value);

        operationCounter++;
        emit CalculationPerformed(operationCounter, "multiplyProduct", 0);
    }

    /**
     * Calculate compound interest
     *
     * chapter: arithmetic
     *
     * Demonstrates complex arithmetic on encrypted values
     *
     * @param _principal Encrypted principal amount
     * @param _rate Interest rate (as plain number, e.g., 5 for 5%)
     * @param _periods Number of compounding periods
     * @return result Encrypted final amount after compound interest
     */
    function calculateCompoundInterest(
        euint32 _principal,
        uint256 _rate,
        uint256 _periods
    ) external pure returns (euint32) {
        euint32 result = _principal;
        euint32 rateEnc = FHE.asEuint32(_rate);
        euint32 base = FHE.asEuint32(100);

        // Compound: result = principal * (1 + rate/100) ^ periods
        for (uint256 i = 0; i < _periods; i++) {
            // Calculate: result * (1 + rate/100)
            euint32 growthRate = FHE.div(rateEnc, base);
            euint32 growthFactor = FHE.add(FHE.asEuint32(100), growthRate);
            result = FHE.div(FHE.mul(result, growthFactor), base);
        }

        return result;
    }

    /**
     * Calculate average of encrypted numbers
     *
     * chapter: arithmetic
     *
     * Demonstrates averaging encrypted values
     *
     * @param _values Array of encrypted values
     * @return average Encrypted average value
     */
    function calculateAverage(euint32[] calldata _values)
        external
        pure
        returns (euint32)
    {
        require(_values.length > 0, "Cannot average empty array");

        euint32 sum = FHE.asEuint32(0);

        for (uint256 i = 0; i < _values.length; i++) {
            sum = FHE.add(sum, _values[i]);
        }

        return FHE.div(sum, FHE.asEuint32(_values.length));
    }

    /**
     * Calculate variance of encrypted numbers
     *
     * chapter: arithmetic
     *
     * Demonstrates statistical operations on encrypted data
     *
     * @param _values Array of encrypted values
     * @return variance Encrypted variance
     */
    function calculateVariance(euint32[] calldata _values)
        external
        pure
        returns (euint32)
    {
        require(_values.length > 0, "Cannot calculate variance of empty array");

        // Calculate mean
        euint32 sum = FHE.asEuint32(0);
        for (uint256 i = 0; i < _values.length; i++) {
            sum = FHE.add(sum, _values[i]);
        }
        euint32 mean = FHE.div(sum, FHE.asEuint32(_values.length));

        // Calculate sum of squared differences
        euint32 varianceSum = FHE.asEuint32(0);
        for (uint256 i = 0; i < _values.length; i++) {
            euint32 diff = FHE.sub(_values[i], mean);
            euint32 squaredDiff = FHE.mul(diff, diff);
            varianceSum = FHE.add(varianceSum, squaredDiff);
        }

        return FHE.div(varianceSum, FHE.asEuint32(_values.length));
    }

    /**
     * Deposit encrypted amount to user balance
     *
     * chapter: arithmetic
     *
     * Banking pattern with encrypted operations
     *
     * @param _amount Encrypted amount to deposit
     */
    function deposit(euint32 _amount) external {
        euint32 currentBalance = encryptedBalances[msg.sender];
        encryptedBalances[msg.sender] = FHE.add(currentBalance, _amount);

        // Update global total
        euint32 total32 = FHE.asEuint32(uint256(encryptedTotal));
        encryptedTotal = FHE.add(encryptedTotal, _amount);

        operationCounter++;
        emit BalanceUpdated(msg.sender, 0); // Balance is encrypted
    }

    /**
     * Withdraw encrypted amount from user balance
     *
     * chapter: arithmetic
     *
     * @param _amount Encrypted amount to withdraw
     */
    function withdraw(euint32 _amount) external {
        euint32 currentBalance = encryptedBalances[msg.sender];

        // Check if sufficient balance (encrypted comparison)
        ebool hasBalance = FHE.gte(currentBalance, _amount);
        require(FHE.decrypt(hasBalance), "Insufficient balance");

        encryptedBalances[msg.sender] = FHE.sub(currentBalance, _amount);

        // Update global total
        encryptedTotal = FHE.sub(encryptedTotal, _amount);

        operationCounter++;
        emit BalanceUpdated(msg.sender, 0);
    }

    /**
     * Get encrypted user balance
     *
     * chapter: arithmetic
     *
     * @return balance User's encrypted balance
     */
    function getBalance() external view returns (euint32) {
        return encryptedBalances[msg.sender];
    }

    /**
     * Get encrypted global sum
     *
     * chapter: arithmetic
     *
     * @return sum The global encrypted sum
     */
    function getGlobalSum() external view returns (euint32) {
        return encryptedSum;
    }

    /**
     * Get encrypted global total
     *
     * chapter: arithmetic
     *
     * @return total The global encrypted total
     */
    function getGlobalTotal() external view returns (euint64) {
        return encryptedTotal;
    }

    /**
     * Calculate encrypted score
     *
     * chapter: arithmetic
     *
     * Complex calculation pattern
     *
     * @param _baseScore Base encrypted score
     * @param _multiplier Multiplier (plaintext)
     * @return finalScore Final encrypted score
     */
    function calculateScore(euint32 _baseScore, uint256 _multiplier)
        external
        pure
        returns (euint64)
    {
        euint32 multiplier32 = FHE.asEuint32(_multiplier);
        euint32 multiplied = FHE.mul(_baseScore, multiplier32);

        // Convert to euint64 for larger range
        return FHE.asEuint64(FHE.decrypt(multiplied));
    }

    /**
     * Perform batch operations
     *
     * chapter: arithmetic
     *
     * Demonstrates multiple operations in one transaction
     *
     * @param _values Array of values to process
     * @return sum Encrypted sum of all values
     * @return product Encrypted product of all values
     * @return average Encrypted average of all values
     */
    function batchOperations(euint32[] calldata _values)
        external
        pure
        returns (euint32, euint32, euint32)
    {
        require(_values.length > 0, "Empty array");

        euint32 sum = FHE.asEuint32(0);
        euint32 product = FHE.asEuint32(1);

        for (uint256 i = 0; i < _values.length; i++) {
            sum = FHE.add(sum, _values[i]);
            product = FHE.mul(product, _values[i]);
        }

        euint32 average = FHE.div(sum, FHE.asEuint32(_values.length));

        return (sum, product, average);
    }
}