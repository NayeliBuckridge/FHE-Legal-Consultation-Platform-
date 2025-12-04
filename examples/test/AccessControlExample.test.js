/**
 * Test Suite: Access Control Pattern Example
 *
 * chapter: access-control
 *
 * This test suite validates the access control pattern demonstrating:
 * - FHE.allow() for permanent decryption access
 * - FHE.allowTransient() for temporary access
 * - Permission management and revocation
 * - Selective data visibility without revealing content
 *
 * @author Zama FHEVM Examples
 * @license MIT
 *
 * Test Categories:
 * - File upload and access control
 * - Temporary vs permanent access
 * - Permission revocation
 * - Batch operations
 * - Edge cases and security
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Access Control Example", function () {
  let contract;
  let owner, user1, user2, user3;

  /**
   * chapter: access-control
   *
   * Setup: Deploy contract and get signers
   *
   * Initializes test environment with multiple accounts
   * to test access control between different users
   */
  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("AccessControlExample");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * Deployment and Initialization Tests
   *
   * chapter: access-control
   *
   * Verifies contract deployment and initial state
   */
  describe("Deployment", function () {
    /**
     * chapter: access-control
     *
     * Test: Should deploy successfully
     *
     * Validates that the contract deploys with correct admin address
     */
    it("Should deploy successfully", async function () {
      expect(await contract.admin()).to.equal(owner.address);
    });

    /**
     * chapter: access-control
     *
     * Test: Should initialize counter to zero
     *
     * Verifies initial state is correct
     */
    it("Should initialize file counter to zero", async function () {
      expect(await contract.fileCounter()).to.equal(0);
    });
  });

  /**
   * File Upload Tests
   *
   * chapter: access-control
   *
   * Tests the file upload functionality with encryption
   */
  describe("File Upload", function () {
    /**
     * chapter: access-control
     *
     * Test: Should upload encrypted file successfully
     *
     * Validates file upload creates file ID and grants owner access
     */
    it("Should upload encrypted file successfully", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      const tx = await contract.connect(user1).uploadFile(encryptedContent, false);
      const receipt = await tx.wait();

      expect(await contract.fileCounter()).to.equal(1);

      // Check owner can access file
      const content = await contract.connect(user1).getFileContent(1);
      expect(content).to.exist;

      // Check file metadata
      const [ownerAddr, timestamp, isPublic] = await contract.getFileMetadata(1);
      expect(ownerAddr).to.equal(user1.address);
      expect(isPublic).to.be.false;
    });

    /**
     * chapter: access-control
     *
     * Test: Should upload public file successfully
     *
     * Validates public file upload allows anyone to decrypt
     */
    it("Should upload public file successfully", async function () {
      const encryptedContent = await ethers.encryptValue(67890);

      await contract.connect(user1).uploadFile(encryptedContent, true);

      // Check file metadata shows it's public
      const [, , isPublic] = await contract.getFileMetadata(1);
      expect(isPublic).to.be.true;

      // Other users should be able to access public files
      const content = await contract.connect(user2).getFileContent(1);
      expect(content).to.exist;
    });
  });

  /**
   * Access Control Tests
   *
   * chapter: access-control
   *
   * Tests access control mechanisms
   */
  describe("Access Control", function () {
    /**
     * chapter: access-control
     *
     * Test: Should deny access to unauthorized users
     *
     * Validates that unauthorized users cannot access private files
     */
    it("Should deny access to unauthorized users", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      await contract.connect(user1).uploadFile(encryptedContent, false);

      // Unauthorized user should be denied access
      await expect(
        contract.connect(user2).getFileContent(1)
      ).to.be.revertedWith("Access denied");
    });

    /**
     * chapter: access-control
     *
     * Test: Should grant permanent access successfully
     *
     * Validates FHE.allow() grants permanent decryption access
     */
    it("Should grant permanent access successfully", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      await contract.connect(user1).uploadFile(encryptedContent, false);

      // Grant permanent access
      await contract.connect(user1).grantPermanentAccess(1, user2.address);

      // User2 should now have access
      const content = await contract.connect(user2).getFileContent(1);
      expect(content).to.exist;
    });

    /**
     * chapter: access-control
     *
     * Test: Should grant temporary access successfully
     *
     * Validates FHE.allowTransient() grants temporary access
     */
    it("Should grant temporary access successfully", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      await contract.connect(user1).uploadFile(encryptedContent, false);

      // Grant temporary access (only for current transaction)
      await contract.connect(user1).grantTemporaryAccess(1, user2.address);

      // Temporary access should be granted
      const hasAccess = await contract.hasAccess(1, user2.address);
      expect(hasAccess).to.be.true;
    });

    /**
     * chapter: access-control
     *
     * Test: Should prevent non-owner from granting access
     *
     * Validates permission enforcement
     */
    it("Should prevent non-owner from granting access", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      await contract.connect(user1).uploadFile(encryptedContent, false);

      // Non-owner should not be able to grant access
      await expect(
        contract.connect(user2).grantPermanentAccess(1, user3.address)
      ).to.be.reverted;
    });
  });

  /**
   * Access Revocation Tests
   *
   * chapter: access-control
   *
   * Tests access revocation functionality
   */
  describe("Access Revocation", function () {
    /**
     * chapter: access-control
     *
     * Test: Should revoke access successfully
     *
     * Tests revocation of permanent access
     */
    it("Should revoke access successfully", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      await contract.connect(user1).uploadFile(encryptedContent, false);
      await contract.connect(user1).grantPermanentAccess(1, user2.address);

      // Verify access before revocation
      const hasAccessBefore = await contract.hasAccess(1, user2.address);
      expect(hasAccessBefore).to.be.true;

      // Revoke access
      await contract.connect(user1).revokeAccess(1, user2.address);

      // Verify access after revocation
      const hasAccessAfter = await contract.hasAccess(1, user2.address);
      expect(hasAccessAfter).to.be.false;
    });
  });

  /**
   * Batch Operations Tests
   *
   * chapter: access-control
   *
   * Tests batch functionality for efficiency
   */
  describe("Batch Operations", function () {
    /**
     * chapter: access-control
     *
     * Test: Should upload shared document with multiple users
     *
     * Tests batch access granting during upload
     */
    it("Should upload shared document with multiple users", async function () {
      const encryptedContent = await ethers.encryptValue(12345);
      const users = [user2.address, user3.address];

      const fileId = await contract.connect(user1).uploadSharedDocument(
        encryptedContent,
        users
      );

      expect(fileId).to.equal(1);

      // All specified users should have access
      const hasAccessUser2 = await contract.hasAccess(1, user2.address);
      const hasAccessUser3 = await contract.hasAccess(1, user3.address);

      expect(hasAccessUser2).to.be.true;
      expect(hasAccessUser3).to.be.true;
    });

    /**
     * chapter: access-control
     *
     * Test: Should batch grant access to multiple users
     *
     * Tests efficient batch access granting
     */
    it("Should batch grant access to multiple users", async function () {
      const encryptedContent = await ethers.encryptValue(12345);
      const users = [user2.address, user3.address];

      await contract.connect(user1).uploadFile(encryptedContent, false);

      // Batch grant access
      await contract.connect(user1).batchGrantAccess(1, users);

      // All users should have access
      for (const user of users) {
        const hasAccess = await contract.hasAccess(1, user);
        expect(hasAccess).to.be.true;
      }
    });
  });

  /**
   * Edge Cases Tests
   *
   * chapter: access-control
   *
   * Tests edge cases and boundary conditions
   */
  describe("Edge Cases", function () {
    /**
     * chapter: access-control
     *
     * Test: Should handle invalid file ID
     *
     * Tests error handling for invalid inputs
     */
    it("Should handle invalid file ID", async function () {
      await expect(
        contract.connect(user1).grantPermanentAccess(999, user2.address)
      ).to.be.revertedWith("Invalid file ID");

      await expect(
        contract.connect(user1).getFileContent(999)
      ).to.be.revertedWith("Invalid file ID");
    });

    /**
     * chapter: access-control
     *
     * Test: Should handle admin access
     *
     * Tests that admin has special privileges
     */
    it("Should handle admin access", async function () {
      const encryptedContent = await ethers.encryptValue(12345);

      await contract.connect(user1).uploadFile(encryptedContent, false);

      // Admin should be able to grant access to any file
      await contract.connect(owner).grantPermanentAccess(1, user2.address);

      // User2 should now have access due to admin action
      const hasAccess = await contract.hasAccess(1, user2.address);
      expect(hasAccess).to.be.true;
    });

    /**
     * chapter: access-control
     *
     * Test: Should handle empty users array in shared document
     *
     * Tests boundary condition with empty array
     */
    it("Should handle empty users array in shared document", async function () {
      const encryptedContent = await ethers.encryptValue(12345);
      const emptyUsers = [];

      const fileId = await contract.connect(user1).uploadSharedDocument(
        encryptedContent,
        emptyUsers
      );

      expect(fileId).to.equal(1);

      // Only owner should have access
      const ownerHasAccess = await contract.hasAccess(1, user1.address);
      const otherHasAccess = await contract.hasAccess(1, user2.address);

      expect(ownerHasAccess).to.be.true;
      expect(otherHasAccess).to.be.false;
    });
  });

  /**
   * Integration Tests
   *
   * chapter: access-control
   *
   * Tests complete workflows
   */
  describe("Integration", function () {
    /**
     * chapter: access-control
     *
     * Test: Should complete full access control workflow
     *
     * Tests end-to-end access control scenario
     */
    it("Should complete full access control workflow", async function () {
      // 1. User1 uploads file
      const encryptedContent = await ethers.encryptValue(12345);
      await contract.connect(user1).uploadFile(encryptedContent, false);

      // 2. Verify only User1 has access initially
      expect(await contract.hasAccess(1, user1.address)).to.be.true;
      expect(await contract.hasAccess(1, user2.address)).to.be.false;

      // 3. Grant temporary access to User2
      await contract.connect(user1).grantTemporaryAccess(1, user2.address);
      expect(await contract.hasAccess(1, user2.address)).to.be.true;

      // 4. Grant permanent access to User3
      await contract.connect(user1).grantPermanentAccess(1, user3.address);
      expect(await contract.hasAccess(1, user3.address)).to.be.true;

      // 5. Revoke access from User2
      await contract.connect(user1).revokeAccess(1, user2.address);
      expect(await contract.hasAccess(1, user2.address)).to.be.false;

      // 6. Verify owner and User3 still have access
      expect(await contract.hasAccess(1, user1.address)).to.be.true;
      expect(await contract.hasAccess(1, user3.address)).to.be.true;
    });
  });
});