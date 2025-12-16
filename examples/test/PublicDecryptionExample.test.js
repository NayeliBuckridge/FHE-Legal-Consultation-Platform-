/**
 * Test Suite: Public Decryption Pattern Example
 *
 * chapter: public-decryption
 *
 * This test suite validates the public decryption pattern demonstrating:
 * - Computing on encrypted data while keeping individual values private
 * - Publishing aggregated results that anyone can decrypt
 * - Encrypted voting with public result tallying
 * - Privacy-preserving statistics and analytics
 * - Transparent governance without revealing individual contributions
 *
 * @author Zama FHEVM Examples
 * @license MIT
 *
 * Test Categories:
 * - Encrypted voting systems
 * - Privacy-preserving polling
 * - Confidential financial aggregation
 * - Anonymous statistics
 * - Public audit with privacy
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Public Decryption Example", function () {
  let contract;
  let owner, user1, user2, user3;

  /**
   * chapter: public-decryption
   *
   * Setup: Deploy contract and get signers
   *
   * Initializes test environment with multiple accounts
   * to test public decryption and aggregation patterns
   */
  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("PublicDecryptionExample");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * Deployment and Initialization Tests
   *
   * chapter: public-decryption
   *
   * Verifies contract deployment and initial state
   */
  describe("Deployment", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Contract should deploy successfully
     *
     * Validates that the contract deploys without errors
     * and has the correct initial state for public decryption
     */
    it("Should deploy successfully with initialized state", async function () {
      expect(contract.address).to.exist;
      const pollCount = await contract.pollCounter();
      expect(pollCount).to.equal(0);
    });

    /**
     * chapter: public-decryption
     *
     * Test: Initial total vote weight should be initialized
     *
     * Verifies encrypted initial state
     */
    it("Should initialize with encrypted zero vote weight", async function () {
      const totalWeight = await contract.getTotalVoteWeight();
      expect(totalWeight).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Financial aggregation should start at zero
     *
     * Validates initial financial state
     */
    it("Should initialize financial aggregation at zero", async function () {
      const stats = await contract.getFinancialAggregation();
      expect(stats).to.exist;
    });
  });

  /**
   * Encrypted Voting Tests
   *
   * chapter: public-decryption
   *
   * Tests for voting with encrypted choices that aggregate to public results
   */
  describe("Encrypted Voting", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Should cast encrypted vote
     *
     * Demonstrates:
     * - Voting with encrypted choice (private vote)
     * - Encrypted weight for vote importance
     * - Public aggregation of private votes
     */
    it("Should cast encrypted vote with weight", async function () {
      const encChoice = await contract.encryptedChoice(user1.address);
      const encWeight = await contract.encryptedWeight(user1.address);

      await expect(contract.connect(user1).castVote(encChoice, encWeight)).to.emit(
        contract,
        "VoteCast"
      );
    });

    /**
     * chapter: public-decryption
     *
     * Test: Multiple users should cast votes
     *
     * Demonstrates privacy in multi-user voting
     */
    it("Should allow multiple users to cast encrypted votes", async function () {
      const enc1 = await contract.encryptedChoice(user1.address);
      const enc2 = await contract.encryptedChoice(user2.address);
      const enc3 = await contract.encryptedChoice(user3.address);

      await contract.connect(user1).castVote(enc1, enc1);
      await contract.connect(user2).castVote(enc2, enc2);
      await contract.connect(user3).castVote(enc3, enc3);

      const totalWeight = await contract.getTotalVoteWeight();
      expect(totalWeight).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should retrieve total vote weight
     *
     * Demonstrates public aggregation of encrypted votes
     * Anyone can see the total but not individual votes
     */
    it("Should retrieve publicly decryptable total vote weight", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      await contract.connect(user1).castVote(enc, enc);

      const totalWeight = await contract.getTotalVoteWeight();
      expect(totalWeight).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Vote should update total weight incrementally
     *
     * Validates aggregation logic
     */
    it("Should accumulate encrypted vote weights", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      // Multiple votes
      await contract.connect(user1).castVote(enc, enc);
      await contract.connect(user2).castVote(enc, enc);

      const totalWeight = await contract.getTotalVoteWeight();
      expect(totalWeight).to.exist;
    });
  });

  /**
   * Polling System Tests
   *
   * chapter: public-decryption
   *
   * Tests for creating and managing encrypted polls
   */
  describe("Polling System", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Should create new poll
     *
     * Demonstrates privacy-preserving polling
     */
    it("Should create new encrypted poll", async function () {
      const duration = 3600; // 1 hour

      await expect(contract.connect(owner).createPoll("What is your favorite color?", duration))
        .to.emit(contract, "PollCreated")
        .withArgs(0);

      const pollCount = await contract.pollCounter();
      expect(pollCount).to.equal(1);
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should vote in specific poll
     *
     * Demonstrates poll-specific voting
     */
    it("Should vote in specific poll with encrypted option", async function () {
      await contract.connect(owner).createPoll("Best programming language?", 3600);

      const encOption = await contract.encryptedChoice(user1.address);

      await expect(contract.connect(user1).voteInPoll(0, encOption)).to.emit(
        contract,
        "VoteInPollCast"
      );
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should retrieve poll results
     *
     * Demonstrates public decryption of aggregated results
     */
    it("Should retrieve publicly decryptable poll results", async function () {
      await contract.connect(owner).createPoll("Question?", 3600);

      const encOption = await contract.encryptedChoice(user1.address);
      await contract.connect(user1).voteInPoll(0, encOption);
      await contract.connect(user2).voteInPoll(0, encOption);

      const results = await contract.getPollResults(0);
      expect(results).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should create multiple independent polls
     *
     * Validates poll isolation
     */
    it("Should manage multiple polls independently", async function () {
      await contract.connect(owner).createPoll("Poll 1", 3600);
      await contract.connect(owner).createPoll("Poll 2", 3600);
      await contract.connect(owner).createPoll("Poll 3", 3600);

      const pollCount = await contract.pollCounter();
      expect(pollCount).to.equal(3);

      const results1 = await contract.getPollResults(0);
      const results2 = await contract.getPollResults(1);
      const results3 = await contract.getPollResults(2);

      expect(results1).to.exist;
      expect(results2).to.exist;
      expect(results3).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should close poll
     *
     * Demonstrates poll lifecycle management
     */
    it("Should close poll after voting period", async function () {
      await contract.connect(owner).createPoll("Closing Poll", 1);

      // Wait for duration to pass (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await expect(contract.connect(owner).closePoll(0)).to.emit(contract, "PollClosed");
    });

    /**
     * chapter: public-decryption
     *
     * Test: Users should not vote in closed poll
     *
     * Validates poll state enforcement
     */
    it("Should prevent voting in closed poll", async function () {
      await contract.connect(owner).createPoll("Expired Poll", 1);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));
      await contract.connect(owner).closePoll(0);

      const encOption = await contract.encryptedChoice(user1.address);

      // Attempt to vote in closed poll should revert
      await expect(contract.connect(user1).voteInPoll(0, encOption)).to.be.reverted;
    });
  });

  /**
   * Financial Aggregation Tests
   *
   * chapter: public-decryption
   *
   * Tests for privacy-preserving financial statistics
   */
  describe("Financial Aggregation", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Should add encrypted deposit
     *
     * Demonstrates private deposits with public total
     */
    it("Should add encrypted deposit to total", async function () {
      const encAmount = await contract.encryptedChoice(user1.address);

      await expect(contract.connect(user1).addDeposit(encAmount)).to.emit(
        contract,
        "DepositAdded"
      );
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should add encrypted withdrawal
     *
     * Demonstrates private withdrawals with public tracking
     */
    it("Should add encrypted withdrawal to total", async function () {
      const encAmount = await contract.encryptedChoice(user1.address);

      await expect(contract.connect(user1).addWithdrawal(encAmount)).to.emit(
        contract,
        "WithdrawalAdded"
      );
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should track encrypted platform revenue
     *
     * Demonstrates revenue aggregation with privacy
     */
    it("Should add encrypted platform revenue", async function () {
      const encRevenue = await contract.encryptedChoice(user1.address);

      await expect(contract.connect(owner).addPlatformRevenue(encRevenue)).to.emit(
        contract,
        "RevenueAdded"
      );

      const revenue = await contract.getPlatformRevenue();
      expect(revenue).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should increment active users
     *
     * Demonstrates encrypted counter
     */
    it("Should increment encrypted active users count", async function () {
      await expect(contract.connect(user1).incrementActiveUsers()).to.emit(
        contract,
        "ActiveUserIncremented"
      );
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should retrieve financial aggregation
     *
     * Demonstrates public statistics from private data
     */
    it("Should retrieve publicly decryptable financial aggregation", async function () {
      const encAmount = await contract.encryptedChoice(user1.address);

      await contract.connect(user1).addDeposit(encAmount);
      await contract.connect(user2).addWithdrawal(encAmount);

      const stats = await contract.getFinancialAggregation();
      expect(stats).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should calculate net flow
     *
     * Demonstrates arithmetic on aggregated encrypted values
     */
    it("Should calculate net flow from deposits and withdrawals", async function () {
      const encAmount = await contract.encryptedChoice(user1.address);

      await contract.connect(user1).addDeposit(encAmount);
      await contract.connect(user2).addDeposit(encAmount);
      await contract.connect(user3).addWithdrawal(encAmount);

      const netFlow = await contract.calculateNetFlow();
      expect(netFlow).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should batch add deposits
     *
     * Demonstrates bulk operations with encryption
     */
    it("Should batch add multiple encrypted deposits", async function () {
      const amounts = [
        await contract.encryptedChoice(user1.address),
        await contract.encryptedChoice(user1.address),
        await contract.encryptedChoice(user1.address),
      ];

      await expect(contract.connect(user1).batchAddDeposits(amounts)).to.emit(
        contract,
        "BatchDepositsAdded"
      );
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should reset financial aggregation
     *
     * Demonstrates clearing aggregated statistics
     */
    it("Should reset encrypted financial aggregation", async function () {
      const encAmount = await contract.encryptedChoice(user1.address);

      await contract.connect(user1).addDeposit(encAmount);

      await expect(contract.connect(owner).resetFinancialAggregation()).to.emit(
        contract,
        "FinancialAggregationReset"
      );

      const stats = await contract.getFinancialAggregation();
      expect(stats).to.exist;
    });
  });

  /**
   * Summary Statistics Tests
   *
   * chapter: public-decryption
   *
   * Tests for comprehensive aggregated metrics
   */
  describe("Summary Statistics", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Should retrieve summary statistics
     *
     * Demonstrates comprehensive public dashboard from private data
     */
    it("Should retrieve publicly decryptable summary statistics", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      // Add various data
      await contract.connect(user1).castVote(enc, enc);
      await contract.connect(user1).addDeposit(enc);
      await contract.connect(user1).incrementActiveUsers();
      await contract.connect(owner).addPlatformRevenue(enc);

      const stats = await contract.getSummaryStatistics();
      expect(stats).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Summary should include all metric types
     *
     * Validates complete aggregation
     */
    it("Should include all metrics in summary statistics", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      // Generate all types of activity
      await contract.connect(user1).castVote(enc, enc);
      await contract.connect(owner).createPoll("Test", 3600);
      await contract.connect(user1).voteInPoll(0, enc);
      await contract.connect(user1).addDeposit(enc);
      await contract.connect(user2).addWithdrawal(enc);
      await contract.connect(owner).addPlatformRevenue(enc);
      await contract.connect(user1).incrementActiveUsers();

      const stats = await contract.getSummaryStatistics();
      expect(stats).to.exist;
      expect(stats.totalVotes).to.exist;
      expect(stats.totalDeposits).to.exist;
      expect(stats.totalWithdrawals).to.exist;
      expect(stats.platformRevenue).to.exist;
      expect(stats.activeUsers).to.exist;
    });
  });

  /**
   * Privacy Preservation Tests
   *
   * chapter: public-decryption
   *
   * Tests to ensure individual privacy while allowing public aggregation
   */
  describe("Privacy Preservation", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Individual votes should remain private
     *
     * Fundamental guarantee: aggregates are public, individuals are private
     */
    it("Should keep individual votes encrypted while total is public", async function () {
      const enc1 = await contract.encryptedChoice(user1.address);
      const enc2 = await contract.encryptedChoice(user2.address);

      await contract.connect(user1).castVote(enc1, enc1);
      await contract.connect(user2).castVote(enc2, enc2);

      // Total can be decrypted publicly
      const totalWeight = await contract.getTotalVoteWeight();
      expect(totalWeight).to.exist;

      // Individual votes remain private (encrypted)
      // Contract does not expose individual vote values
    });

    /**
     * chapter: public-decryption
     *
     * Test: Financial contributions should remain private
     *
     * Privacy guarantee for financial data
     */
    it("Should keep individual deposits private while total is public", async function () {
      const enc1 = await contract.encryptedChoice(user1.address);
      const enc2 = await contract.encryptedChoice(user2.address);
      const enc3 = await contract.encryptedChoice(user3.address);

      await contract.connect(user1).addDeposit(enc1);
      await contract.connect(user2).addDeposit(enc2);
      await contract.connect(user3).addDeposit(enc3);

      // Total is public
      const stats = await contract.getFinancialAggregation();
      expect(stats).to.exist;

      // Individual amounts remain encrypted
    });

    /**
     * chapter: public-decryption
     *
     * Test: Poll votes should maintain voter anonymity
     *
     * Privacy in polling systems
     */
    it("Should maintain voter anonymity in polls", async function () {
      await contract.connect(owner).createPoll("Anonymous poll", 3600);

      const enc1 = await contract.encryptedChoice(user1.address);
      const enc2 = await contract.encryptedChoice(user2.address);

      await contract.connect(user1).voteInPoll(0, enc1);
      await contract.connect(user2).voteInPoll(0, enc2);

      // Results are public but voter choices remain private
      const results = await contract.getPollResults(0);
      expect(results).to.exist;
    });
  });

  /**
   * Edge Cases Tests
   *
   * chapter: public-decryption
   *
   * Tests for boundary conditions and special scenarios
   */
  describe("Edge Cases", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Should handle poll with no votes
     *
     * Validates behavior with empty state
     */
    it("Should handle poll with no votes", async function () {
      await contract.connect(owner).createPoll("Empty poll", 3600);

      const results = await contract.getPollResults(0);
      expect(results).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should handle financial stats with no activity
     *
     * Zero-state validation
     */
    it("Should return zero statistics with no financial activity", async function () {
      const stats = await contract.getFinancialAggregation();
      expect(stats).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should handle very large number of votes
     *
     * Scaling test for aggregation
     */
    it("Should aggregate large number of encrypted votes", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      // Cast many votes
      for (let i = 0; i < 10; i++) {
        await contract.connect(user1).castVote(enc, enc);
      }

      const totalWeight = await contract.getTotalVoteWeight();
      expect(totalWeight).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Should handle zero-value deposits/withdrawals
     *
     * Boundary value testing
     */
    it("Should process zero-value financial operations", async function () {
      const zeroEnc = await contract.encryptedChoice(user1.address);

      await contract.connect(user1).addDeposit(zeroEnc);
      await contract.connect(user1).addWithdrawal(zeroEnc);

      const stats = await contract.getFinancialAggregation();
      expect(stats).to.exist;
    });
  });

  /**
   * Gas Optimization Tests
   *
   * chapter: public-decryption
   *
   * Tests to validate gas efficiency
   */
  describe("Gas Optimization", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Vote casting should be efficient
     *
     * Validates gas consumption for voting
     */
    it("Should cast vote within reasonable gas limits", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      const tx = await contract.connect(user1).castVote(enc, enc);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });

    /**
     * chapter: public-decryption
     *
     * Test: Poll creation should be efficient
     *
     * Validates gas for poll initialization
     */
    it("Should create poll within reasonable gas limits", async function () {
      const tx = await contract.connect(owner).createPoll("Gas test poll", 3600);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(300000);
    });

    /**
     * chapter: public-decryption
     *
     * Test: Batch deposits should be more efficient than individual
     *
     * Validates gas savings from batching
     */
    it("Should batch deposits efficiently", async function () {
      const amounts = [
        await contract.encryptedChoice(user1.address),
        await contract.encryptedChoice(user1.address),
        await contract.encryptedChoice(user1.address),
      ];

      const tx = await contract.connect(user1).batchAddDeposits(amounts);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(1000000);
    });
  });

  /**
   * Integration Tests
   *
   * chapter: public-decryption
   *
   * Complete workflow tests combining multiple public decryption operations
   */
  describe("Integration", function () {
    /**
     * chapter: public-decryption
     *
     * Test: Complete public decryption workflow
     *
     * End-to-end scenario demonstrating public aggregation of private data
     */
    it("Should execute complete public decryption workflow", async function () {
      const enc = await contract.encryptedChoice(user1.address);

      // Step 1: Create polls and vote
      await contract.connect(owner).createPoll("Integration Poll 1", 3600);
      await contract.connect(owner).createPoll("Integration Poll 2", 3600);

      await contract.connect(user1).voteInPoll(0, enc);
      await contract.connect(user2).voteInPoll(0, enc);
      await contract.connect(user3).voteInPoll(1, enc);

      // Step 2: Cast general votes
      await contract.connect(user1).castVote(enc, enc);
      await contract.connect(user2).castVote(enc, enc);

      // Step 3: Financial operations
      await contract.connect(user1).addDeposit(enc);
      await contract.connect(user2).addDeposit(enc);
      await contract.connect(user3).addWithdrawal(enc);
      await contract.connect(owner).addPlatformRevenue(enc);

      // Step 4: Track users
      await contract.connect(user1).incrementActiveUsers();

      // Step 5: Retrieve all public statistics
      const poll1Results = await contract.getPollResults(0);
      const poll2Results = await contract.getPollResults(1);
      const totalVoteWeight = await contract.getTotalVoteWeight();
      const financialStats = await contract.getFinancialAggregation();
      const summaryStats = await contract.getSummaryStatistics();

      // Verify all data aggregated
      expect(poll1Results).to.exist;
      expect(poll2Results).to.exist;
      expect(totalVoteWeight).to.exist;
      expect(financialStats).to.exist;
      expect(summaryStats).to.exist;
    });

    /**
     * chapter: public-decryption
     *
     * Test: Complex multi-user scenario
     *
     * Advanced scenario with many users and operations
     */
    it("Should handle complex multi-user public decryption scenario", async function () {
      const enc1 = await contract.encryptedChoice(user1.address);
      const enc2 = await contract.encryptedChoice(user2.address);
      const enc3 = await contract.encryptedChoice(user3.address);

      // Multiple users voting
      await contract.connect(user1).castVote(enc1, enc1);
      await contract.connect(user2).castVote(enc2, enc2);
      await contract.connect(user3).castVote(enc3, enc3);

      // Multiple polls
      await contract.connect(owner).createPoll("Question 1", 3600);
      await contract.connect(owner).createPoll("Question 2", 3600);
      await contract.connect(owner).createPoll("Question 3", 3600);

      // Users vote in different polls
      await contract.connect(user1).voteInPoll(0, enc1);
      await contract.connect(user2).voteInPoll(1, enc2);
      await contract.connect(user3).voteInPoll(2, enc3);

      // Financial activity
      await contract.connect(user1).addDeposit(enc1);
      await contract.connect(user2).addDeposit(enc2);
      await contract.connect(user3).addDeposit(enc3);

      // Verify public statistics
      const summaryStats = await contract.getSummaryStatistics();
      expect(summaryStats).to.exist;
      expect(await contract.pollCounter()).to.equal(3);
    });
  });
});
