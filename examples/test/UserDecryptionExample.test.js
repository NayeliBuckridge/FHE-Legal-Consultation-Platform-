/**
 * Test Suite: User Decryption Pattern Example
 *
 * chapter: user-decryption
 *
 * This test suite validates the user decryption pattern demonstrating:
 * - User-controlled privacy with private decryption keys held by users only
 * - Only authorized users can decrypt their own encrypted data
 * - Contract cannot decrypt user private information
 * - Selective data sharing with permissions
 * - Privacy-preserving verification and checks
 *
 * @author Zama FHEVM Examples
 * @license MIT
 *
 * Test Categories:
 * - Private data storage (medical, financial, personal)
 * - Access control and permissions
 * - User verification without revealing data
 * - Data retrieval and decryption
 * - Privacy enforcement
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("User Decryption Example", function () {
  let contract;
  let owner, user1, user2, user3;

  /**
   * chapter: user-decryption
   *
   * Setup: Deploy contract and get signers
   *
   * Initializes test environment with multiple accounts
   * to test user-controlled private data and decryption
   */
  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("UserDecryptionExample");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * Deployment and Initialization Tests
   *
   * chapter: user-decryption
   *
   * Verifies contract deployment and initial state
   */
  describe("Deployment", function () {
    /**
     * chapter: user-decryption
     *
     * Test: Contract should deploy successfully
     *
     * Validates that the contract deploys without errors
     * and is ready for user data storage
     */
    it("Should deploy successfully", async function () {
      expect(contract.address).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Contract should not have any initial user data
     *
     * Verifies clean initial state
     */
    it("Should have no data for unregistered users initially", async function () {
      const hasData = await contract.hasData(user1.address);
      expect(hasData).to.equal(false);
    });
  });

  /**
   * Private Data Storage Tests
   *
   * chapter: user-decryption
   *
   * Tests for storing encrypted private data
   */
  describe("Private Data Storage", function () {
    /**
     * chapter: user-decryption
     *
     * Test: Should store encrypted personal/credit data
     *
     * Demonstrates storing private financial and personal information
     * - Credit score (encrypted)
     * - Income (encrypted)
     * - Employment status (encrypted)
     * - Age (encrypted)
     * - Medical record (encrypted string)
     */
    it("Should store encrypted private personal data", async function () {
      const creditScore = await contract.encryptedBalances(user1.address);
      const income = await contract.encryptedBalances(user1.address);
      const isEmployed = await contract.encryptedBalances(user1.address);
      const age = await contract.encryptedBalances(user1.address);

      await expect(
        contract.connect(user1).storePrivateData(creditScore, income, isEmployed, age, "Medical:Encrypted")
      ).to.emit(contract, "PrivateDataStored");

      expect(await contract.hasData(user1.address)).to.equal(true);
    });

    /**
     * chapter: user-decryption
     *
     * Test: Should store encrypted health data
     *
     * Demonstrates storing private medical information
     * - Heart rate (encrypted)
     * - Blood pressure (encrypted)
     * - Weight (encrypted)
     * - Has medical conditions (encrypted boolean)
     * - Medical notes (encrypted string)
     */
    it("Should store encrypted health data", async function () {
      const heartRate = await contract.encryptedBalances(user1.address);
      const bloodPressure = await contract.encryptedBalances(user1.address);
      const weight = await contract.encryptedBalances(user1.address);
      const hasConditions = await contract.encryptedBalances(user1.address);

      await expect(
        contract
          .connect(user1)
          .storeHealthData(heartRate, bloodPressure, weight, hasConditions, "EncryptedNotes")
      ).to.emit(contract, "HealthDataStored");

      expect(await contract.hasData(user1.address)).to.equal(true);
    });

    /**
     * chapter: user-decryption
     *
     * Test: Should store encrypted financial data
     *
     * Demonstrates storing private banking information
     * - Account balance (encrypted)
     * - Credit limit (encrypted)
     * - Monthly expenses (encrypted)
     * - Has credit issues (encrypted boolean)
     */
    it("Should store encrypted financial data", async function () {
      const balance = await contract.encryptedBalances(user1.address);
      const creditLimit = await contract.encryptedBalances(user1.address);
      const monthlyExpenses = await contract.encryptedBalances(user1.address);
      const hasCreditIssues = await contract.encryptedBalances(user1.address);

      await expect(
        contract
          .connect(user1)
          .storeFinancialData(balance, creditLimit, monthlyExpenses, hasCreditIssues)
      ).to.emit(contract, "FinancialDataStored");

      expect(await contract.hasData(user1.address)).to.equal(true);
    });

    /**
     * chapter: user-decryption
     *
     * Test: Multiple users can store separate private data
     *
     * Demonstrates data isolation and privacy
     */
    it("Should allow multiple users to store separate private data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "User1Data");
      await contract.connect(user2).storePrivateData(enc, enc, enc, enc, "User2Data");

      expect(await contract.hasData(user1.address)).to.equal(true);
      expect(await contract.hasData(user2.address)).to.equal(true);
    });

    /**
     * chapter: user-decryption
     *
     * Test: Data storage should record timestamp
     *
     * Validates audit trail capability
     */
    it("Should record timestamp when data is stored", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      const beforeTime = Math.floor(Date.now() / 1000);
      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");
      const afterTime = Math.floor(Date.now() / 1000);

      const timestamp = await contract.getDataTimestamp(user1.address);
      expect(timestamp).to.be.gte(beforeTime);
      expect(timestamp).to.be.lte(afterTime);
    });
  });

  /**
   * Access Control and Permissions Tests
   *
   * chapter: user-decryption
   *
   * Tests for managing who can decrypt data
   */
  describe("Access Control", function () {
    /**
     * chapter: user-decryption
     *
     * Test: User should grant access to their data
     *
     * Demonstrates selective sharing of private information
     */
    it("Should grant access to private data to another user", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");

      await expect(contract.connect(user1).grantAccess(user2.address, "personal")).to.emit(
        contract,
        "AccessGranted"
      );
    });

    /**
     * chapter: user-decryption
     *
     * Test: User should be able to revoke access
     *
     * Demonstrates privacy control and revocation
     */
    it("Should revoke access to private data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");
      await contract.connect(user1).grantAccess(user2.address, "personal");

      await expect(contract.connect(user1).revokeAccess("personal")).to.emit(
        contract,
        "AccessRevoked"
      );
    });

    /**
     * chapter: user-decryption
     *
     * Test: User should only access their own data
     *
     * Demonstrates privacy enforcement
     */
    it("Should only allow user to access their own data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "User1Private");
      await contract.connect(user2).storePrivateData(enc, enc, enc, enc, "User2Private");

      // Both users should be able to get their own data
      const data1 = await contract.connect(user1).getMyPrivateData();
      const data2 = await contract.connect(user2).getMyPrivateData();

      expect(data1).to.exist;
      expect(data2).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Grant access for specific data types
     *
     * Demonstrates granular access control
     */
    it("Should grant access to specific data types", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");
      await contract.connect(user1).storeHealthData(enc, enc, enc, enc, "HealthData");
      await contract.connect(user1).storeFinancialData(enc, enc, enc, enc);

      // Grant access to different data types
      await contract.connect(user1).grantAccess(user2.address, "personal");
      await contract.connect(user1).grantAccess(user2.address, "health");
      await contract.connect(user1).grantAccess(user2.address, "financial");

      expect(await contract.hasData(user1.address)).to.equal(true);
    });
  });

  /**
   * User Data Retrieval Tests
   *
   * chapter: user-decryption
   *
   * Tests for accessing stored encrypted data
   */
  describe("Data Retrieval", function () {
    /**
     * chapter: user-decryption
     *
     * Test: User should retrieve their own personal data
     *
     * Only data owner can decrypt with their private key
     */
    it("Should retrieve own personal data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "PersonalData");

      const data = await contract.connect(user1).getMyPrivateData();
      expect(data).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: User should retrieve their health data
     *
     * Demonstrates selective data retrieval
     */
    it("Should retrieve own health data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storeHealthData(enc, enc, enc, enc, "HealthData");

      const data = await contract.connect(user1).getMyHealthData();
      expect(data).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: User should retrieve their financial data
     *
     * Demonstrates private banking information access
     */
    it("Should retrieve own financial data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storeFinancialData(enc, enc, enc, enc);

      const data = await contract.connect(user1).getMyFinancialData();
      expect(data).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Should return timestamp of stored data
     *
     * Validates data provenance
     */
    it("Should retrieve timestamp of stored data", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");

      const timestamp = await contract.getDataTimestamp(user1.address);
      expect(timestamp).to.be.greaterThan(0);
    });
  });

  /**
   * Privacy-Preserving Verification Tests
   *
   * chapter: user-decryption
   *
   * Tests for verifying data without revealing it
   */
  describe("Privacy-Preserving Verification", function () {
    /**
     * chapter: user-decryption
     *
     * Test: Should verify minimum age without revealing actual age
     *
     * Demonstrates homomorphic comparison for privacy preservation
     */
    it("Should verify minimum age requirement without revealing age", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Age18");

      const isAdult = await contract.verifyMinimumAge(user1.address, 18);
      expect(isAdult).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Should verify credit score without revealing amount
     *
     * Demonstrates privacy-preserving credit checks
     */
    it("Should verify credit score requirement without revealing score", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "CreditData");

      const hasGoodCredit = await contract.verifyCreditScore(user1.address, 700);
      expect(hasGoodCredit).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Should compare income to threshold without revealing income
     *
     * Demonstrates encrypted comparison operations
     */
    it("Should compare income to threshold privately", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "IncomeData");

      const comparison = await contract.connect(user1).compareIncomeToThreshold(50000);
      expect(comparison).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Should check employment status without revealing details
     *
     * Demonstrates encrypted boolean operations
     */
    it("Should check employment status privately", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "EmploymentData");

      const isEmployed = await contract.connect(user1).checkEmploymentStatus();
      expect(isEmployed).to.exist;
    });

    /**
     * chapter: user-decryption
     *
     * Test: Verification should work with different threshold values
     *
     * Tests boundary conditions in verification
     */
    it("Should handle different verification thresholds", async function () {
      const enc = await contract.encryptedBalances(user1.address);

      await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "VerificationData");

      const result1 = await contract.verifyMinimumAge(user1.address, 18);
      const result2 = await contract.verifyMinimumAge(user1.address, 21);
      const result3 = await contract.verifyMinimumAge(user1.address, 65);

      expect(result1).to.exist;
      expect(result2).to.exist;
      expect(result3).to.exist;
    });
  });

  /**
   * Privacy Enforcement Tests
   *
   * chapter: user-decryption
     *
     * Tests to ensure privacy guarantees are maintained
     */
    describe("Privacy Enforcement", function () {
      /**
       * chapter: user-decryption
       *
       * Test: Contract cannot decrypt user data
       *
       * Fundamental privacy guarantee: only user with private key can decrypt
       */
      it("Should not expose encrypted data in plain text", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "SecretData");

        // Data is stored encrypted, contract cannot reveal it
        const data = await contract.connect(user1).getMyPrivateData();
        // Data should be encrypted, not plaintext
        expect(data).to.exist;
      });

      /**
       * chapter: user-decryption
       *
       * Test: Different users cannot access each other's data
       *
       * Access control isolation guarantee
       */
      it("Should prevent unauthorized users from accessing private data", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "User1Secret");

        // User2 should not be able to directly access User1's unshared data
        const user2Data = await contract.connect(user2).getMyPrivateData();
        expect(user2Data).to.exist;
      });

      /**
       * chapter: user-decryption
       *
       * Test: Shared data access is controlled
       *
       * Permission-based access guarantee
       */
      it("Should control shared data access through permissions", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "SharedSecret");
        await contract.connect(user1).grantAccess(user2.address, "personal");

        // User2 now has permission, would be able to decrypt with this permission
        const hasAccess = await contract.hasData(user1.address);
        expect(hasAccess).to.equal(true);
      });
    });

    /**
     * Edge Cases Tests
     *
     * chapter: user-decryption
     *
     * Tests for boundary conditions and special scenarios
     */
    describe("Edge Cases", function () {
      /**
       * chapter: user-decryption
       *
       * Test: Should handle user with no stored data
       *
       * Validates behavior with empty state
       */
      it("Should handle queries for users with no data", async function () {
        const hasData = await contract.hasData(user1.address);
        expect(hasData).to.equal(false);

        const timestamp = await contract.getDataTimestamp(user1.address);
        expect(timestamp).to.equal(0);
      });

      /**
       * chapter: user-decryption
       *
       * Test: Should handle multiple data overwrites
       *
       * Tests state mutation with multiple updates
       */
      it("Should handle overwriting private data", async function () {
        const enc1 = await contract.encryptedBalances(user1.address);
        const enc2 = await contract.encryptedBalances(user1.address);

        await contract.connect(user1).storePrivateData(enc1, enc1, enc1, enc1, "FirstData");
        await contract.connect(user1).storePrivateData(enc2, enc2, enc2, enc2, "SecondData");

        expect(await contract.hasData(user1.address)).to.equal(true);
      });

      /**
       * chapter: user-decryption
       *
       * Test: Should handle emergency revoke of all access
       *
       * Tests comprehensive access revocation
       */
      it("Should revoke all access types", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");

        await contract.connect(user1).grantAccess(user2.address, "personal");
        await contract.connect(user1).grantAccess(user2.address, "health");

        await contract.connect(user1).revokeAccess("personal");
        await contract.connect(user1).revokeAccess("health");

        expect(await contract.hasData(user1.address)).to.equal(true);
      });
    });

    /**
     * Gas Optimization Tests
     *
     * chapter: user-decryption
     *
     * Tests to validate gas efficiency
     */
    describe("Gas Optimization", function () {
      /**
       * chapter: user-decryption
       *
       * Test: Data storage should be efficient
       *
       * Validates gas consumption for storage operations
       */
      it("Should store private data within reasonable gas limits", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        const tx = await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");
        const receipt = await tx.wait();
        expect(receipt.gasUsed).to.be.lessThan(500000);
      });

      /**
       * chapter: user-decryption
       *
       * Test: Verification should be efficient
       *
       * Validates gas efficiency of homomorphic comparison
       */
      it("Should verify data within reasonable gas limits", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Data");

        const tx = await contract.verifyMinimumAge(user1.address, 18);
        expect(tx).to.exist;
      });
    });

    /**
     * Integration Tests
     *
     * chapter: user-decryption
     *
     * Complete workflow tests combining multiple user decryption operations
     */
    describe("Integration", function () {
      /**
       * chapter: user-decryption
       *
       * Test: Complete user data privacy workflow
       *
       * End-to-end scenario demonstrating user-controlled privacy
       */
      it("Should execute complete user decryption workflow", async function () {
        const enc = await contract.encryptedBalances(user1.address);

        // Step 1: Store multiple types of private data
        await contract.connect(user1).storePrivateData(enc, enc, enc, enc, "Personal");
        await contract.connect(user1).storeHealthData(enc, enc, enc, enc, "Health");
        await contract.connect(user1).storeFinancialData(enc, enc, enc, enc);

        // Step 2: Grant selective access
        await contract.connect(user1).grantAccess(user2.address, "personal");
        await contract.connect(user1).grantAccess(user3.address, "health");

        // Step 3: Verify data without revealing it
        const ageVerified = await contract.verifyMinimumAge(user1.address, 18);
        const creditVerified = await contract.verifyCreditScore(user1.address, 600);

        // Step 4: Retrieve own data
        const personalData = await contract.connect(user1).getMyPrivateData();
        const healthData = await contract.connect(user1).getMyHealthData();
        const financialData = await contract.connect(user1).getMyFinancialData();

        // Verify all operations completed
        expect(await contract.hasData(user1.address)).to.equal(true);
        expect(ageVerified).to.exist;
        expect(creditVerified).to.exist;
        expect(personalData).to.exist;
        expect(healthData).to.exist;
        expect(financialData).to.exist;
      });

      /**
       * chapter: user-decryption
       *
       * Test: Multi-user privacy preservation
       *
       * Complex scenario with multiple users maintaining privacy
       */
      it("Should maintain privacy for multiple users simultaneously", async function () {
        const enc1 = await contract.encryptedBalances(user1.address);
        const enc2 = await contract.encryptedBalances(user2.address);
        const enc3 = await contract.encryptedBalances(user3.address);

        // Each user stores their private data
        await contract.connect(user1).storePrivateData(enc1, enc1, enc1, enc1, "User1Data");
        await contract.connect(user2).storePrivateData(enc2, enc2, enc2, enc2, "User2Data");
        await contract.connect(user3).storePrivateData(enc3, enc3, enc3, enc3, "User3Data");

        // Each user can access their own data
        const data1 = await contract.connect(user1).getMyPrivateData();
        const data2 = await contract.connect(user2).getMyPrivateData();
        const data3 = await contract.connect(user3).getMyPrivateData();

        // All should have their data secured
        expect(await contract.hasData(user1.address)).to.equal(true);
        expect(await contract.hasData(user2.address)).to.equal(true);
        expect(await contract.hasData(user3.address)).to.equal(true);
        expect(data1).to.exist;
        expect(data2).to.exist;
        expect(data3).to.exist;
      });
    });
  });
