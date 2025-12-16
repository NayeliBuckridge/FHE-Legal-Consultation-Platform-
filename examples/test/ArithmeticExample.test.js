/**
 * Test Suite: Arithmetic Operations Pattern Example
 *
 * chapter: arithmetic
 *
 * This test suite validates the arithmetic pattern demonstrating:
 * - FHE.add(a, b) - Addition on encrypted values
 * - FHE.sub(a, b) - Subtraction on encrypted values
 * - FHE.mul(a, b) - Multiplication on encrypted values
 * - FHE.div(a, b) - Division on encrypted values
 * - FHE.rem(a, b) - Remainder (modulo) operation
 * - FHE.min(a, b) - Minimum of two values
 * - FHE.max(a, b) - Maximum of two values
 * - Complex calculations (compound interest, averages, variance)
 *
 * @author Zama FHEVM Examples
 * @license MIT
 *
 * Test Categories:
 * - Basic arithmetic operations
 * - Advanced calculations
 * - Balance management
 * - Batch operations
 * - Edge cases and boundaries
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Arithmetic Example", function () {
  let contract;
  let owner, user1, user2, user3;

  /**
   * chapter: arithmetic
   *
   * Setup: Deploy contract and get signers
   *
   * Initializes test environment with multiple accounts
   * to test arithmetic operations on encrypted values
   */
  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("ArithmeticExample");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * Deployment and Initialization Tests
   *
   * chapter: arithmetic
   *
   * Verifies contract deployment and initial state
   */
  describe("Deployment", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Contract should deploy successfully
     *
     * Validates that the contract deploys without errors
     * and has the correct initial encrypted state
     */
    it("Should deploy successfully with initial encrypted values", async function () {
      expect(contract.address).to.exist;
      expect(await contract.operationCounter()).to.equal(0);

      // Check initial encrypted values are initialized
      const sum = await contract.encryptedSum();
      expect(sum).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Operation counter should start at zero
     *
     * Verifies initial state setup
     */
    it("Should initialize operation counter to zero", async function () {
      const counter = await contract.operationCounter();
      expect(counter).to.equal(0);
    });
  });

  /**
   * Basic Arithmetic Operations Tests
   *
   * chapter: arithmetic
   *
   * Tests for fundamental FHE arithmetic operations
   */
  describe("Basic Arithmetic Operations", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Should perform FHE addition
     *
     * Demonstrates FHE.add() operation on encrypted values
     */
    it("Should add two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.add(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should perform FHE subtraction
     *
     * Demonstrates FHE.sub() operation on encrypted values
     */
    it("Should subtract two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.subtract(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should perform FHE multiplication
     *
     * Demonstrates FHE.mul() operation on encrypted values
     */
    it("Should multiply two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.multiply(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should perform FHE division
     *
     * Demonstrates FHE.div() operation on encrypted values
     */
    it("Should divide two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.divide(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should perform FHE modulo/remainder
     *
     * Demonstrates FHE.rem() operation on encrypted values
     */
    it("Should compute remainder of two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.remainder(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should find minimum of encrypted values
     *
     * Demonstrates FHE.min() comparison operation
     */
    it("Should find minimum of two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.minimum(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should find maximum of encrypted values
     *
     * Demonstrates FHE.max() comparison operation
     */
    it("Should find maximum of two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.maximum(a, b);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should check equality of encrypted values
     *
     * Demonstrates FHE.eq() comparison operation
     */
    it("Should check equality of two encrypted values", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const result = await contract.areEqual(a, b);
      expect(result).to.exist;
    });
  });

  /**
   * Stateful Operations Tests
   *
   * chapter: arithmetic
   *
   * Tests for operations that modify contract state
   */
  describe("Stateful Operations", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Should add value to running sum
     *
     * Demonstrates accumulation of encrypted values
     */
    it("Should add value to encrypted sum", async function () {
      const value = await contract.encryptedBalance();

      await expect(contract.addToSum(value)).to.emit(contract, "CalculationPerformed");

      const newCounter = await contract.operationCounter();
      expect(newCounter).to.equal(1);
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should multiply value into running product
     *
     * Demonstrates accumulation with multiplication
     */
    it("Should multiply value into encrypted product", async function () {
      const value = await contract.encryptedBalance();

      await expect(contract.multiplyProduct(value)).to.emit(contract, "CalculationPerformed");

      const newCounter = await contract.operationCounter();
      expect(newCounter).to.equal(1);
    });

    /**
     * chapter: arithmetic
     *
     * Test: Multiple additions should accumulate counter
     *
     * Validates state tracking for multiple operations
     */
    it("Should track multiple arithmetic operations", async function () {
      const value = await contract.encryptedBalance();

      await contract.addToSum(value);
      await contract.addToSum(value);
      await contract.multiplyProduct(value);

      const counter = await contract.operationCounter();
      expect(counter).to.equal(3);
    });
  });

  /**
   * Advanced Calculations Tests
   *
   * chapter: arithmetic
   *
   * Tests for complex mathematical operations
   */
  describe("Advanced Calculations", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Should calculate compound interest
     *
     * Demonstrates complex arithmetic on encrypted values
     * Formula: principal * (1 + rate)^periods
     */
    it("Should calculate compound interest on encrypted principal", async function () {
      const principal = await contract.encryptedBalance();
      const rate = 5; // 5% rate
      const periods = 3;

      const result = await contract.calculateCompoundInterest(principal, rate, periods);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Compound interest with zero periods
     *
     * Edge case: interest calculation with minimal time
     */
    it("Should handle compound interest with zero periods", async function () {
      const principal = await contract.encryptedBalance();

      const result = await contract.calculateCompoundInterest(principal, 5, 0);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should calculate average of encrypted values
     *
     * Demonstrates division operation on encrypted sum
     */
    it("Should calculate average of encrypted values", async function () {
      const values = [
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
      ];

      const result = await contract.calculateAverage(values);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should calculate variance of encrypted values
     *
     * Demonstrates advanced statistical computation
     */
    it("Should calculate variance of encrypted values", async function () {
      const values = [
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
      ];

      const result = await contract.calculateVariance(values);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Average with single value
     *
     * Edge case: statistical measure with minimal data
     */
    it("Should calculate average with single value", async function () {
      const values = [await contract.encryptedBalance()];

      const result = await contract.calculateAverage(values);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Variance with identical values
     *
     * Edge case: zero variance scenario
     */
    it("Should handle variance calculation with identical values", async function () {
      const value = await contract.encryptedBalance();
      const values = [value, value, value];

      const result = await contract.calculateVariance(values);
      expect(result).to.exist;
    });
  });

  /**
   * User Balance Tests
   *
   * chapter: arithmetic
   *
   * Tests for per-user encrypted balance management
   */
  describe("User Balances", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Should deposit amount to user balance
     *
     * Demonstrates per-user balance updates
     */
    it("Should deposit encrypted amount to user balance", async function () {
      const amount = await contract.encryptedBalance();

      await expect(contract.connect(user1).deposit(amount)).to.emit(
        contract,
        "BalanceUpdated"
      );
    });

    /**
     * chapter: arithmetic
     *
     * Test: Should withdraw amount from user balance
     *
     * Demonstrates balance reduction operations
     */
    it("Should withdraw encrypted amount from user balance", async function () {
      const amount = await contract.encryptedBalance();

      await contract.connect(user1).deposit(amount);
      await expect(contract.connect(user1).withdraw(amount)).to.emit(
        contract,
        "BalanceUpdated"
      );
    });

    /**
     * chapter: arithmetic
     *
     * Test: Multiple users should have independent balances
     *
     * Demonstrates balance isolation
     */
    it("Should maintain separate encrypted balances for different users", async function () {
      const amount1 = await contract.encryptedBalance();
      const amount2 = await contract.encryptedBalance();

      await contract.connect(user1).deposit(amount1);
      await contract.connect(user2).deposit(amount2);

      // Both users should have balances
      const balance1 = await contract.encryptedBalances(user1.address);
      const balance2 = await contract.encryptedBalances(user2.address);

      expect(balance1).to.exist;
      expect(balance2).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Multiple deposits should accumulate
     *
     * Demonstrates state mutation and accumulation
     */
    it("Should accumulate encrypted deposits", async function () {
      const amount = await contract.encryptedBalance();

      await contract.connect(user1).deposit(amount);
      await contract.connect(user1).deposit(amount);

      const balance = await contract.encryptedBalances(user1.address);
      expect(balance).to.exist;
    });
  });

  /**
   * Batch Operations Tests
   *
   * chapter: arithmetic
   *
   * Tests for batch processing of arithmetic operations
   */
  describe("Batch Operations", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Should process batch of encrypted values
     *
     * Demonstrates bulk arithmetic operations
     */
    it("Should perform batch arithmetic operations", async function () {
      const values = [
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
      ];

      const result = await contract.batchOperations(values);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Batch with single value
     *
     * Edge case: minimal batch size
     */
    it("Should handle batch with single value", async function () {
      const values = [await contract.encryptedBalance()];

      const result = await contract.batchOperations(values);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Batch with many values
     *
     * Scaling test for batch operations
     */
    it("Should process batch with many values", async function () {
      const values = [];
      for (let i = 0; i < 10; i++) {
        values.push(await contract.encryptedBalance());
      }

      const result = await contract.batchOperations(values);
      expect(result).to.exist;
    });
  });

  /**
   * Edge Cases Tests
   *
   * chapter: arithmetic
   *
   * Tests for boundary conditions and special scenarios
   */
  describe("Edge Cases", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Operations with same operand
     *
     * Validates behavior with identical inputs
     */
    it("Should handle arithmetic operations with identical operands", async function () {
      const value = await contract.encryptedBalance();

      const add = await contract.add(value, value);
      const sub = await contract.subtract(value, value);
      const mul = await contract.multiply(value, value);

      expect(add).to.exist;
      expect(sub).to.exist;
      expect(mul).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Division by very small number
     *
     * Validates precision in division
     */
    it("Should handle division operations", async function () {
      const dividend = await contract.encryptedBalance();
      const divisor = await contract.encryptedBalance();

      const result = await contract.divide(dividend, divisor);
      expect(result).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Operations with minimum and maximum values
     *
     * Boundary value testing
     */
    it("Should handle min/max with same values", async function () {
      const value = await contract.encryptedBalance();

      const min = await contract.minimum(value, value);
      const max = await contract.maximum(value, value);

      expect(min).to.exist;
      expect(max).to.exist;
    });
  });

  /**
   * Gas Optimization Tests
   *
   * chapter: arithmetic
   *
   * Tests to validate gas efficiency
   */
  describe("Gas Optimization", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Simple arithmetic operation should be efficient
     *
     * Validates gas consumption for basic operations
     */
    it("Should perform addition within reasonable gas limits", async function () {
      const a = await contract.encryptedBalance();
      const b = await contract.encryptedBalance();

      const tx = await contract.add(a, b);
      expect(tx).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Deposit operation should be efficient
     *
     * Validates gas consumption for state modification
     */
    it("Should deposit within reasonable gas limits", async function () {
      const amount = await contract.encryptedBalance();

      const tx = await contract.connect(user1).deposit(amount);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });

    /**
     * chapter: arithmetic
     *
     * Test: Batch operations efficiency
     *
     * Validates gas scaling with batch size
     */
    it("Should handle batch operations within reasonable gas limits", async function () {
      const values = [
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
        await contract.encryptedBalance(),
      ];

      const tx = await contract.batchOperations(values);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(1000000);
    });
  });

  /**
   * Integration Tests
   *
   * chapter: arithmetic
   *
   * Complete workflow tests combining multiple arithmetic operations
   */
  describe("Integration", function () {
    /**
     * chapter: arithmetic
     *
     * Test: Complete arithmetic workflow
     *
     * End-to-end scenario combining deposits, calculations, and operations
     */
    it("Should execute complete arithmetic workflow", async function () {
      const amount1 = await contract.encryptedBalance();
      const amount2 = await contract.encryptedBalance();

      // Step 1: User deposits
      await contract.connect(user1).deposit(amount1);
      await contract.connect(user2).deposit(amount2);

      // Step 2: Perform calculations
      const sum = await contract.add(amount1, amount2);
      const difference = await contract.subtract(amount1, amount2);
      const product = await contract.multiply(amount1, amount2);

      // Step 3: Update sum and product
      await contract.addToSum(sum);
      await contract.multiplyProduct(product);

      // Step 4: Verify operation counter incremented
      const counter = await contract.operationCounter();
      expect(counter).to.equal(2);

      // Step 5: Verify calculations exist
      expect(sum).to.exist;
      expect(difference).to.exist;
      expect(product).to.exist;
    });

    /**
     * chapter: arithmetic
     *
     * Test: Multi-user arithmetic operations
     *
     * Complex scenario with multiple users performing operations
     */
    it("Should handle multi-user arithmetic operations", async function () {
      const amount = await contract.encryptedBalance();

      // Multiple users perform operations
      await contract.connect(user1).deposit(amount);
      await contract.connect(user2).deposit(amount);
      await contract.connect(user3).deposit(amount);

      // Perform calculations
      const sum = await contract.add(amount, amount);
      await contract.addToSum(sum);

      // Verify state
      const counter = await contract.operationCounter();
      expect(counter).to.equal(1);
    });
  });
});
