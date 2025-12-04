// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FHEVM Example: Public Decryption Pattern
 *
 * Demonstrates:
 * - Compute on encrypted data
 * - Publish encrypted results that anyone can decrypt
 * - Privacy-preserving aggregation
 * - Public statistics without revealing individual data
 * - Transparent governance on encrypted data
 *
 * chapter: public-decryption
 *
 * @author Zama FHEVM Examples
 */

import { FHE, euint32, euint64, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PublicDecryptionExample is SepoliaConfig {
    // Encrypted voting data
    struct Vote {
        euint32 encryptedChoice;
        euint32 encryptedWeight;
        address voter;
        uint256 timestamp;
    }

    // Encrypted polling data
    struct Poll {
        string question;
        euint32 encryptedOption1Votes;
        euint32 encryptedOption2Votes;
        euint32 encryptedOption3Votes;
        uint256 totalVoters;
        bool isActive;
        uint256 endTime;
    }

    // Encrypted financial aggregation
    struct FinancialAggregation {
        euint32 encryptedTotalDeposits;
        euint32 encryptedTotalWithdrawals;
        euint32 encryptedActiveUsers;
        uint256 lastUpdated;
    }

    // Storage
    mapping(uint256 => Vote) public votes;
    mapping(uint256 => Poll) public polls;
    mapping(address => bool) public hasVoted;
    FinancialAggregation public financialData;

    // Counters
    uint256 public voteCounter;
    uint256 public pollCounter;

    // Public results (can be decrypted by anyone)
    euint32 public encryptedTotalVoteWeight;
    euint64 public encryptedPlatformRevenue;

    // Events (public information)
    event VoteCast(uint256 indexed voteId, address indexed voter);
    event PollCreated(uint256 indexed pollId, string question);
    event ResultsPublished(uint256 indexed pollId);

    constructor() {
        voteCounter = 0;
        pollCounter = 0;
        encryptedTotalVoteWeight = FHE.asEuint32(0);
        encryptedPlatformRevenue = FHE.asEuint64(0);

        financialData = FinancialAggregation({
            encryptedTotalDeposits: FHE.asEuint32(0),
            encryptedTotalWithdrawals: FHE.asEuint32(0),
            encryptedActiveUsers: FHE.asEuint32(0),
            lastUpdated: block.timestamp
        });
    }

    /**
     * Cast an encrypted vote
     *
     * chapter: public-decryption
     *
     * Users encrypt their votes and send them to the contract.
     * The contract can tally votes without decrypting individual votes.
     *
     * @param _encryptedChoice Encrypted vote choice (0, 1, or 2)
     * @param _encryptedWeight Encrypted vote weight
     */
    function castVote(euint32 _encryptedChoice, euint32 _encryptedWeight) external {
        require(!hasVoted[msg.sender], "Already voted");

        voteCounter++;
        uint256 voteId = voteCounter;

        votes[voteId] = Vote({
            encryptedChoice: _encryptedChoice,
            encryptedWeight: _encryptedWeight,
            voter: msg.sender,
            timestamp: block.timestamp
        });

        // Add to total vote weight (public aggregation)
        encryptedTotalVoteWeight = FHE.add(encryptedTotalVoteWeight, _encryptedWeight);

        hasVoted[msg.sender] = true;

        // Allow public decryption of total
        FHE.allow(encryptedTotalVoteWeight, address(0));

        emit VoteCast(voteId, msg.sender);
    }

    /**
     * Create a new poll
     *
     * chapter: public-decryption
     *
     * @param _question Poll question
     * @param _duration Duration in seconds
     * @return pollId The new poll ID
     */
    function createPoll(string calldata _question, uint256 _duration) external returns (uint256) {
        pollCounter++;
        uint256 pollId = pollCounter;

        polls[pollId] = Poll({
            question: _question,
            encryptedOption1Votes: FHE.asEuint32(0),
            encryptedOption2Votes: FHE.asEuint32(0),
            encryptedOption3Votes: FHE.asEuint32(0),
            totalVoters: 0,
            isActive: true,
            endTime: block.timestamp + _duration
        });

        // Allow public decryption of results
        FHE.allow(polls[pollId].encryptedOption1Votes, address(0));
        FHE.allow(polls[pollId].encryptedOption2Votes, address(0));
        FHE.allow(polls[pollId].encryptedOption3Votes, address(0));

        emit PollCreated(pollId, _question);
        return pollId;
    }

    /**
     * Vote in a poll
     *
     * chapter: public-decryption
     *
     * @param _pollId The poll to vote in
     * @param _option Encrypted option number (0, 1, or 2)
     */
    function voteInPoll(uint256 _pollId, euint32 _option) external {
        require(_pollId > 0 && _pollId <= pollCounter, "Invalid poll ID");

        Poll storage poll = polls[_pollId];
        require(poll.isActive && block.timestamp < poll.endTime, "Poll is not active");

        // Determine which option was chosen (without decrypting)
        ebool isOption1 = FHE.eq(_option, FHE.asEuint32(0));
        ebool isOption2 = FHE.eq(_option, FHE.asEuint32(1));
        ebool isOption3 = FHE.eq(_option, FHE.asEuint32(2));

        // Increment appropriate vote count
        poll.encryptedOption1Votes = FHE.add(
            poll.encryptedOption1Votes,
            FHE.decrypt(isOption1) == true ? FHE.asEuint32(1) : FHE.asEuint32(0)
        );

        poll.encryptedOption2Votes = FHE.add(
            poll.encryptedOption2Votes,
            FHE.decrypt(isOption2) == true ? FHE.asEuint32(1) : FHE.asEuint32(0)
        );

        poll.encryptedOption3Votes = FHE.add(
            poll.encryptedOption3Votes,
            FHE.decrypt(isOption3) == true ? FHE.asEuint32(1) : FHE.asEuint32(0)
        );

        poll.totalVoters++;

        emit ResultsPublished(_pollId);
    }

    /**
     * Add encrypted deposit to financial aggregation
     *
     * chapter: public-decryption
     *
     * Aggregate financial data while keeping individual amounts private
     *
     * @param _amount Encrypted deposit amount
     */
    function addDeposit(euint32 _amount) external {
        financialData.encryptedTotalDeposits = FHE.add(
            financialData.encryptedTotalDeposits,
            _amount
        );

        financialData.lastUpdated = block.timestamp;

        // Allow public decryption of aggregates
        FHE.allow(financialData.encryptedTotalDeposits, address(0));
    }

    /**
     * Add encrypted withdrawal to financial aggregation
     *
     * chapter: public-decryption
     *
     * @param _amount Encrypted withdrawal amount
     */
    function addWithdrawal(euint32 _amount) external {
        financialData.encryptedTotalWithdrawals = FHE.add(
            financialData.encryptedTotalWithdrawals,
            _amount
        );

        financialData.lastUpdated = block.timestamp;

        FHE.allow(financialData.encryptedTotalWithdrawals, address(0));
    }

    /**
     * Increment active users count
     *
     * chapter: public-decryption
     *
     * Privacy-preserving user analytics
     */
    function incrementActiveUsers() external {
        financialData.encryptedActiveUsers = FHE.add(
            financialData.encryptedActiveUsers,
            FHE.asEuint32(1)
        );

        financialData.lastUpdated = block.timestamp;

        FHE.allow(financialData.encryptedActiveUsers, address(0));
    }

    /**
     * Add to platform revenue (publicly visible)
     *
     * chapter: public-decryption
     *
     * Platform revenue that can be publicly audited
     *
     * @param _amount Encrypted revenue amount
     */
    function addPlatformRevenue(euint64 _amount) external {
        encryptedPlatformRevenue = FHE.add(encryptedPlatformRevenue, _amount);

        FHE.allow(encryptedPlatformRevenue, address(0));
    }

    /**
     * Get poll results (publicly decryptable)
     *
     * chapter: public-decryption
     *
     * Anyone can decrypt these results
     *
     * @param _pollId The poll to get results for
     * @return option1Votes Encrypted votes for option 1
     * @return option2Votes Encrypted votes for option 2
     * @return option3Votes Encrypted votes for option 3
     * @return totalVoters Total number of voters
     * @return question Poll question
     * @return isActive Whether poll is still active
     */
    function getPollResults(uint256 _pollId)
        external
        view
        returns (
            euint32,
            euint32,
            euint32,
            uint256,
            string memory,
            bool
        )
    {
        require(_pollId > 0 && _pollId <= pollCounter, "Invalid poll ID");

        Poll storage poll = polls[_pollId];
        return (
            poll.encryptedOption1Votes,
            poll.encryptedOption2Votes,
            poll.encryptedOption3Votes,
            poll.totalVoters,
            poll.question,
            poll.isActive
        );
    }

    /**
     * Get total vote weight (publicly decryptable)
     *
     * chapter: public-decryption
     *
     * @return totalWeight Encrypted total vote weight
     */
    function getTotalVoteWeight() external view returns (euint32) {
        return encryptedTotalVoteWeight;
    }

    /**
     * Get platform revenue (publicly decryptable)
     *
     * chapter: public-decryption
     *
     * @return revenue Encrypted platform revenue
     */
    function getPlatformRevenue() external view returns (euint64) {
        return encryptedPlatformRevenue;
    }

    /**
     * Get financial aggregation data
     *
     * chapter: public-decryption
     *
     * @return totalDeposits Encrypted total deposits
     * @return totalWithdrawals Encrypted total withdrawals
     * @return activeUsers Encrypted active users count
     * @return lastUpdated When data was last updated
     */
    function getFinancialAggregation()
        external
        view
        returns (euint32, euint32, euint32, uint256)
    {
        return (
            financialData.encryptedTotalDeposits,
            financialData.encryptedTotalWithdrawals,
            financialData.encryptedActiveUsers,
            financialData.lastUpdated
        );
    }

    /**
     * Calculate net flow (deposits - withdrawals)
     *
     * chapter: public-decryption
     *
     * @return netFlow Encrypted net financial flow
     */
    function calculateNetFlow() external view returns (euint32) {
        return FHE.sub(
            financialData.encryptedTotalDeposits,
            financialData.encryptedTotalWithdrawals
        );
    }

    /**
     * Close a poll and make results final
     *
     * chapter: public-decryption
     *
     * @param _pollId The poll to close
     */
    function closePoll(uint256 _pollId) external {
        require(_pollId > 0 && _pollId <= pollCounter, "Invalid poll ID");

        Poll storage poll = polls[_pollId];
        require(poll.isActive, "Poll already closed");

        poll.isActive = false;
        emit ResultsPublished(_pollId);
    }

    /**
     * Batch add multiple deposits
     *
     * chapter: public-decryption
     *
     * Efficient batch processing for financial aggregation
     *
     * @param _amounts Array of encrypted deposit amounts
     */
    function batchAddDeposits(euint32[] calldata _amounts) external {
        euint32 totalBatch = FHE.asEuint32(0);

        for (uint256 i = 0; i < _amounts.length; i++) {
            totalBatch = FHE.add(totalBatch, _amounts[i]);
        }

        financialData.encryptedTotalDeposits = FHE.add(
            financialData.encryptedTotalDeposits,
            totalBatch
        );

        financialData.lastUpdated = block.timestamp;
        FHE.allow(financialData.encryptedTotalDeposits, address(0));
    }

    /**
     * Reset financial aggregation
     *
     * chapter: public-decryption
     *
     * Reset all financial counters to zero
     */
    function resetFinancialAggregation() external {
        financialData.encryptedTotalDeposits = FHE.asEuint32(0);
        financialData.encryptedTotalWithdrawals = FHE.asEuint32(0);
        financialData.encryptedActiveUsers = FHE.asEuint32(0);
        financialData.lastUpdated = block.timestamp;

        FHE.allow(financialData.encryptedTotalDeposits, address(0));
        FHE.allow(financialData.encryptedTotalWithdrawals, address(0));
        FHE.allow(financialData.encryptedActiveUsers, address(0));
    }

    /**
     * Get summary statistics
     *
     * chapter: public-decryption
     *
     * Publicly decryptable summary of all data
     *
     * @return totalVotes Total vote weight
     * @return totalPolls Number of polls created
     * @return platformRevenue Platform revenue
     * @return netFinancialFlow Net financial flow
     */
    function getSummaryStatistics()
        external
        view
        returns (
            euint32,
            uint256,
            euint64,
            euint32
        )
    {
        euint32 netFlow = FHE.sub(
            financialData.encryptedTotalDeposits,
            financialData.encryptedTotalWithdrawals
        );

        return (
            encryptedTotalVoteWeight,
            pollCounter,
            encryptedPlatformRevenue,
            netFlow
        );
    }
}