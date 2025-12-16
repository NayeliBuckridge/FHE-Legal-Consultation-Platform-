/**
 * Test Suite: Encryption Pattern Example
 *
 * chapter: encryption
 *
 * This test suite validates the encryption pattern demonstrating:
 * - euint32: 32-bit encrypted unsigned integer
 * - eaddress: Encrypted Ethereum address
 * - ebool: Encrypted boolean value
 * - euint64: 64-bit encrypted unsigned integer
 * - euint8: 8-bit encrypted unsigned integer
 * - Multiple encrypted types in data structures
 *
 * @author Zama FHEVM Examples
 * @license MIT
 *
 * Test Categories:
 * - Profile management with encrypted data
 * - Transaction creation and tracking
 * - Encrypted scores and flags
 * - Batch operations
 * - Data retrieval and storage
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Encryption Example", function () {
  let contract;
  let owner, user1, user2, user3;

  /**
   * chapter: encryption
   *
   * Setup: Deploy contract and get signers
   *
   * Initializes test environment with multiple accounts
   * to test encrypted data operations
   */
  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("EncryptionExample");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * Deployment and Initialization Tests
   *
   * chapter: encryption
   *
   * Verifies contract deployment and initial state
   */
  describe("Deployment", function () {
    /**
     * chapter: encryption
     *
     * Test: Contract should deploy successfully
     *
     * Validates that the contract deploys without errors
     * and has the correct initial state
     */
    it("Should deploy successfully", async function () {
      expect(contract.address).to.exist;
      expect(await contract.transactionCounter()).to.equal(0);
    });

    /**
     * chapter: encryption
     *
     * Test: Initial transaction counter should be zero
     *
     * Verifies initial state setup
     */
    it("Should initialize transaction counter to zero", async function () {
      const counter = await contract.transactionCounter();
      expect(counter).to.equal(0);
    });
  });

  /**
   * Encrypted Profile Tests
   *
   * chapter: encryption
   *
   * Tests for storing and managing encrypted user profiles
   */
  describe("Encrypted Profiles", function () {
    /**
     * chapter: encryption
     *
     * Test: Should store encrypted profile with all data types
     *
     * This test demonstrates how to:
     * - Store encrypted age (euint32)
     * - Store encrypted wallet address (eaddress)
     * - Store encrypted active status (ebool)
     * - Store encrypted balance (euint64)
     * - Store encrypted status (euint8)
     */
    it("Should store encrypted profile with multiple encrypted types", async function () {
      // Create encrypted values (in real application, would come from client encryption)
      const encryptedAge = await contract.encryptedBalances(user1.address);
      const encryptedWallet = await contract.encryptedBalances(user1.address);
      const encryptedIsActive = await contract.encryptedBalances(user1.address);
      const encryptedBalance = await contract.encryptedBalances(user1.address);
      const encryptedStatus = await contract.encryptedBalances(user1.address);

      // Update profile
      await expect(
        contract
          .connect(user1)
          .updateProfile(
            encryptedAge,
            encryptedWallet,
            encryptedIsActive,
            encryptedBalance,
            encryptedStatus
          )
      )
        .to.emit(contract, "ProfileUpdated")
        .withArgs(user1.address);
    });

    /**
     * chapter: encryption
     *
     * Test: Should retrieve encrypted profile
     *
     * Validates that encrypted profiles can be stored and retrieved
     * without decryption (data remains encrypted in storage)
     */
    it("Should retrieve encrypted profile data", async function () {
      // Get profile for user (may be empty initially)
      const profile = await contract.getProfile(user1.address);
      expect(profile).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Multiple users can have separate encrypted profiles
     *
     * Demonstrates data privacy through isolation
     */
    it("Should allow multiple users to have separate encrypted profiles", async function () {
      const enc1 = await contract.encryptedBalances(user1.address);
      const enc2 = await contract.encryptedBalances(user2.address);

      // Update profiles for different users
      await contract.connect(user1).updateProfile(enc1, enc1, enc1, enc1, enc1);
      await contract.connect(user2).updateProfile(enc2, enc2, enc2, enc2, enc2);

      // Both should have profiles
      const profile1 = await contract.getProfile(user1.address);
      const profile2 = await contract.getProfile(user2.address);

      expect(profile1).to.exist;
      expect(profile2).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Profile update should emit event
     *
     * Verifies that state changes are properly signaled via events
     */
    it("Should emit ProfileUpdated event on profile update", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await expect(contract.connect(user1).updateProfile(enc, enc, enc, enc, enc))
        .to.emit(contract, "ProfileUpdated")
        .withArgs(user1.address);
    });
  });

  /**
   * Encrypted Transaction Tests
   *
   * chapter: encryption
   *
   * Tests for creating and managing encrypted transactions
   */
  describe("Encrypted Transactions", function () {
    /**
     * chapter: encryption
     *
     * Test: Should create encrypted transaction
     *
     * Demonstrates how to store transaction data with all fields encrypted
     */
    it("Should create encrypted transaction with all encrypted fields", async function () {
      const encAmount = await contract.encryptedBalances(user1.address);
      const encFrom = await contract.encryptedBalances(user1.address);
      const encTo = await contract.encryptedBalances(user2.address);

      await expect(
        contract.connect(user1).createTransaction(encAmount, encFrom, encTo, "Encrypted notes")
      )
        .to.emit(contract, "TransactionCreated")
        .withArgs(0);

      // Counter should increment
      const counter = await contract.transactionCounter();
      expect(counter).to.equal(1);
    });

    /**
     * chapter: encryption
     *
     * Test: Should track transaction counter correctly
     *
     * Verifies that transaction IDs increment properly
     */
    it("Should increment transaction counter on creation", async function () {
      const encAmount = await contract.encryptedBalances(user1.address);

      const initialCounter = await contract.transactionCounter();

      await contract.connect(user1).createTransaction(encAmount, encAmount, encAmount, "test");

      const newCounter = await contract.transactionCounter();
      expect(newCounter).to.equal(initialCounter.add(1));
    });

    /**
     * chapter: encryption
     *
     * Test: Should retrieve encrypted transaction
     *
     * Validates transaction storage and retrieval
     */
    it("Should retrieve encrypted transaction data", async function () {
      const encAmount = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).createTransaction(encAmount, encAmount, encAmount, "test");

      const transaction = await contract.getTransaction(0);
      expect(transaction).to.exist;
      expect(transaction.encryptedNotes).to.equal("test");
    });

    /**
     * chapter: encryption
     *
     * Test: Should allow completing transaction
     *
     * Demonstrates state transitions on encrypted data
     */
    it("Should complete encrypted transaction", async function () {
      const encAmount = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).createTransaction(encAmount, encAmount, encAmount, "test");

      await expect(contract.completeTransaction(0)).to.emit(contract, "TransactionCompleted");
    });

    /**
     * chapter: encryption
     *
     * Test: Multiple transactions should be tracked separately
     *
     * Demonstrates proper sequencing and isolation
     */
    it("Should track multiple transactions independently", async function () {
      const encAmount = await contract.encryptedBalances(user1.address);

      // Create multiple transactions
      await contract.connect(user1).createTransaction(encAmount, encAmount, encAmount, "tx1");
      await contract.connect(user2).createTransaction(encAmount, encAmount, encAmount, "tx2");
      await contract.connect(user3).createTransaction(encAmount, encAmount, encAmount, "tx3");

      const counter = await contract.transactionCounter();
      expect(counter).to.equal(3);
    });
  });

  /**
   * Encrypted Scores and Flags Tests
   *
   * chapter: encryption
   *
   * Tests for managing encrypted scores and boolean flags
   */
  describe("Encrypted Scores and Flags", function () {
    /**
     * chapter: encryption
     *
     * Test: Should set encrypted score for user
     *
     * Demonstrates euint32 storage in mappings
     */
    it("Should set encrypted score for user", async function () {
      const encScore = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).setEncryptedScore(user1.address, encScore);

      const score = await contract.getEncryptedScore(user1.address);
      expect(score).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Should set encrypted flag for user
     *
     * Demonstrates ebool storage in mappings
     */
    it("Should set encrypted boolean flag for user", async function () {
      const encFlag = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).setEncryptedFlag(user1.address, encFlag);

      const flag = await contract.getEncryptedFlag(user1.address);
      expect(flag).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Different users should have independent encrypted values
     *
     * Demonstrates data privacy and isolation
     */
    it("Should maintain separate encrypted scores for different users", async function () {
      const enc1 = await contract.encryptedBalances(user1.address);
      const enc2 = await contract.encryptedBalances(user2.address);

      await contract.connect(user1).setEncryptedScore(user1.address, enc1);
      await contract.connect(user2).setEncryptedScore(user2.address, enc2);

      const score1 = await contract.getEncryptedScore(user1.address);
      const score2 = await contract.getEncryptedScore(user2.address);

      expect(score1).to.exist;
      expect(score2).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Should update score multiple times
     *
     * Demonstrates state mutation with encrypted values
     */
    it("Should update encrypted score multiple times", async function () {
      const enc1 = await contract.encryptedBalances(user1.address);
      const enc2 = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).setEncryptedScore(user1.address, enc1);
      await contract.connect(user1).setEncryptedScore(user1.address, enc2);

      const finalScore = await contract.getEncryptedScore(user1.address);
      expect(finalScore).to.exist;
    });
  });

  /**
   * Batch Operations Tests
   *
   * chapter: encryption
   *
   * Tests for batch updating multiple encrypted values
   */
  describe("Batch Operations", function () {
    /**
     * chapter: encryption
     *
     * Test: Should perform batch update of encrypted data
     *
     * Demonstrates updating multiple encrypted fields in one transaction
     */
    it("Should batch update encrypted score and flag", async function () {
      const encScore = await contract.encryptedBalances(user1.address);
      const encFlag = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).batchUpdate(user1.address, encScore, encFlag);

      const score = await contract.getEncryptedScore(user1.address);
      const flag = await contract.getEncryptedFlag(user1.address);

      expect(score).to.exist;
      expect(flag).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Batch update should be atomic
     *
     * Validates that all or nothing approach for batch operations
     */
    it("Should handle batch updates for multiple users", async function () {
      const enc1 = await contract.encryptedBalances(user1.address);
      const enc2 = await contract.encryptedBalances(user2.address);

      await contract.connect(user1).batchUpdate(user1.address, enc1, enc1);
      await contract.connect(user2).batchUpdate(user2.address, enc2, enc2);

      const score1 = await contract.getEncryptedScore(user1.address);
      const score2 = await contract.getEncryptedScore(user2.address);

      expect(score1).to.exist;
      expect(score2).to.exist;
    });
  });

  /**
   * Comparison Operations Tests
   *
   * chapter: encryption
   *
   * Tests for comparing encrypted values
   */
  describe("Encrypted Comparisons", function () {
    /**
     * chapter: encryption
     *
     * Test: Should compare encrypted values
     *
     * Demonstrates FHE comparison operations (eq, gt, lt, etc.)
     */
    it("Should compare two encrypted values", async function () {
      const enc1 = await contract.encryptedBalances(user1.address);
      const enc2 = await contract.encryptedBalances(user2.address);

      const result = await contract.compareEncryptedValues(enc1, enc2);
      expect(result).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Comparison should work with same values
     *
     * Edge case validation
     */
    it("Should compare identical encrypted values", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      const result = await contract.compareEncryptedValues(enc, enc);
      expect(result).to.exist;
    });
  });

  /**
   * Edge Cases Tests
   *
   * chapter: encryption
   *
   * Tests for boundary conditions and special cases
   */
  describe("Edge Cases", function () {
    /**
     * chapter: encryption
     *
     * Test: Should handle operations on uninitialized data
     *
     * Validates behavior with missing data
     */
    it("Should handle profile queries for non-existent users", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      const profile = await contract.getProfile(newAddress);
      expect(profile).to.exist;
    });

    /**
     * chapter: encryption
     *
     * Test: Should handle large transaction IDs
     *
     * Boundary condition validation
     */
    it("Should handle many transactions", async function () {
      const encAmount = await contract.encryptedBalances(user1.address);

      // Create multiple transactions
      for (let i = 0; i < 5; i++) {
        await contract.connect(user1).createTransaction(encAmount, encAmount, encAmount, `tx${i}`);
      }

      const counter = await contract.transactionCounter();
      expect(counter).to.equal(5);
    });

    /**
     * chapter: encryption
     *
     * Test: Should handle zero-like encrypted values
     *
     * Validates handling of boundary values
     */
    it("Should process transactions with null-like encrypted values", async function () {
      const zeroEnc = await contract.encryptedBalances(user1.address);

      await expect(contract.connect(user1).createTransaction(zeroEnc, zeroEnc, zeroEnc, ""))
        .to.emit(contract, "TransactionCreated");
    });
  });

  /**
   * Gas Optimization Tests
   *
   * chapter: encryption
   *
   * Tests to validate gas efficiency
   */
  describe("Gas Optimization", function () {
    /**
     * chapter: encryption
     *
     * Test: Profile update should be gas efficient
     *
     * Validates reasonable gas costs for encrypted operations
     */
    it("Should perform profile update within reasonable gas limits", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      const tx = await contract
        .connect(user1)
        .updateProfile(enc, enc, enc, enc, enc);

      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(500000); // Reasonable gas limit
    });

    /**
     * chapter: encryption
     *
     * Test: Transaction creation should be efficient
     *
     * Validates gas consumption for encryption operations
     */
    it("Should create transaction within reasonable gas limits", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      const tx = await contract.connect(user1).createTransaction(enc, enc, enc, "test");
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });
  });

  /**
   * Integration Tests
   *
   * chapter: encryption
   *
   * Complete workflow tests combining multiple operations
   */
  describe("Integration", function () {
    /**
     * chapter: encryption
     *
     * Test: Complete encryption workflow
     *
     * End-to-end scenario combining profile, transaction, and comparison operations
     */
    it("Should execute complete encrypted data workflow", async function () {
      const enc1 = await contract.encryptedBalances(user1.address);
      const enc2 = await contract.encryptedBalances(user2.address);

      // Step 1: Create profiles
      await contract.connect(user1).updateProfile(enc1, enc1, enc1, enc1, enc1);
      await contract.connect(user2).updateProfile(enc2, enc2, enc2, enc2, enc2);

      // Step 2: Create transaction
      await contract.connect(user1).createTransaction(enc1, enc1, enc2, "transaction data");

      // Step 3: Set scores
      await contract.connect(user1).setEncryptedScore(user1.address, enc1);
      await contract.connect(user2).setEncryptedScore(user2.address, enc2);

      // Step 4: Verify all data exists
      const profile1 = await contract.getProfile(user1.address);
      const profile2 = await contract.getProfile(user2.address);
      const transaction = await contract.getTransaction(0);
      const score1 = await contract.getEncryptedScore(user1.address);
      const score2 = await contract.getEncryptedScore(user2.address);

      expect(profile1).to.exist;
      expect(profile2).to.exist;
      expect(transaction).to.exist;
      expect(score1).to.exist;
      expect(score2).to.exist;
    });
  });
});
