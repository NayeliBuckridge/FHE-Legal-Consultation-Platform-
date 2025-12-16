# Public Decryption Pattern

## Overview

Aggregating encrypted data with public result decryption - privacy for inputs, transparency for results.

**Category**: `chapter: public-decryption`

## What You'll Learn

- ✅ Encrypted voting systems
- ✅ Privacy-preserving polling
- ✅ Confidential financial aggregation
- ✅ Public statistics with privacy
- ✅ Transparent governance

## Core Concept

Keep inputs private while making aggregated results publicly visible. Perfect for voting, polls, surveys, and any scenario where individual privacy matters but collective results should be transparent.

## Key Patterns

### Pattern 1: Public Voting Results

```solidity
mapping(uint256 => euint32) public encryptedVotes;
euint32 public encryptedTotalVotes;

function vote(euint32 encryptedVote, uint256 proposalId) external {
    // Store encrypted vote
    encryptedVotes[proposalId] = FHE.add(
        encryptedVotes[proposalId],
        encryptedVote
    );
}

function finalizeVoting(uint256 proposalId) external {
    // Make result publicly decryptable
    euint32 total = encryptedVotes[proposalId];
    FHE.allow(total, address(0));  // Public decryption
    encryptedTotalVotes = total;

    emit VotingFinalized(proposalId);
}
```

### Pattern 2: Anonymous Survey Results

```solidity
struct SurveyResults {
    euint32 totalResponses;
    euint32 averageRating;
    ebool consensusReached;
}

mapping(uint256 => SurveyResults) public results;

function submitResponse(
    uint256 surveyId,
    euint32 encryptedRating
) external {
    // Process encrypted rating privately
    // ...

    // When survey ends, make results public
    if (isSurveyComplete(surveyId)) {
        SurveyResults storage result = results[surveyId];
        FHE.allow(result.totalResponses, address(0));
        FHE.allow(result.averageRating, address(0));
        FHE.allow(result.consensusReached, address(0));
    }
}
```

### Pattern 3: Transparent Aggregation

```solidity
function aggregateAndPublish(
    euint32[] calldata privateInputs
) external returns (euint32) {
    euint32 sum = FHE.asEuint32(0);

    // Aggregate privately
    for (uint256 i = 0; i < privateInputs.length; i++) {
        sum = FHE.add(sum, privateInputs[i]);
    }

    // Make result public
    FHE.allowThis(sum);
    FHE.allow(sum, address(0));  // Anyone can decrypt

    return sum;
}
```

## Use Cases

### Voting Systems
```solidity
contract PublicVoting {
    euint32[] public candidateVotes;

    function castVote(uint256 candidateId, euint32 encryptedVote) external {
        // Store vote privately
        candidateVotes[candidateId] = FHE.add(
            candidateVotes[candidateId],
            encryptedVote
        );
    }

    function revealResults() external {
        // Make all vote counts public
        for (uint256 i = 0; i < candidateVotes.length; i++) {
            FHE.allow(candidateVotes[i], address(0));
        }
        emit ResultsRevealed();
    }
}
```

### Financial Aggregation
```solidity
euint64 public encryptedTotalRevenue;

function contributeRevenue(euint64 amount) external {
    // Private contribution
    encryptedTotalRevenue = FHE.add(encryptedTotalRevenue, amount);
}

function publishQuarterlyReport() external onlyAdmin {
    // Make total public
    FHE.allow(encryptedTotalRevenue, address(0));
    emit QuarterlyReportPublished();
}
```

### Anonymous Polling
```solidity
mapping(uint256 => euint32) public pollResults;

function submitPollResponse(
    uint256 pollId,
    euint32 encryptedChoice
) external {
    // Aggregate responses
    pollResults[pollId] = FHE.add(
        pollResults[pollId],
        encryptedChoice
    );
}

function closePoll(uint256 pollId) external {
    // Reveal results to everyone
    FHE.allow(pollResults[pollId], address(0));
    emit PollClosed(pollId);
}
```

## Privacy Guarantees

✅ **What's Private**:
- Individual votes/responses
- User choices
- Personal contributions
- Private inputs

✅ **What's Public**:
- Aggregated totals
- Final results
- Statistical summaries
- Collective outcomes

## Common Patterns

### Pattern: Delayed Publication

```solidity
uint256 public revealTime;

function vote(euint32 encryptedVote) external {
    // Store vote
    votes[msg.sender] = encryptedVote;
}

function revealResults() external {
    require(block.timestamp >= revealTime, "Too early");

    // Calculate total
    euint32 total = calculateTotal();

    // Make public
    FHE.allow(total, address(0));
}
```

### Pattern: Conditional Revelation

```solidity
function revealIfQuorumReached() external {
    euint32 totalVotes = calculateTotalVotes();

    // Only reveal if enough participation
    ebool hasQuorum = FHE.gte(totalVotes, minimumVotes);

    if (hasQuorum) {
        FHE.allow(totalVotes, address(0));
    }
}
```

## Testing

```javascript
it("should aggregate votes privately and reveal publicly", async () => {
    // Cast votes privately
    const vote1 = await createEncryptedInput(contract, voter1, 100);
    const vote2 = await createEncryptedInput(contract, voter2, 150);

    await contract.connect(voter1).vote(vote1.handles[0], vote1.inputProof);
    await contract.connect(voter2).vote(vote2.handles[0], vote2.inputProof);

    // Individual votes remain private
    // ...

    // Reveal results
    await contract.revealResults();

    // Now anyone can decrypt total (250)
    const total = await contract.encryptedTotalVotes();
    // Verify total = 250 (without revealing individual votes)
});
```

## Common Mistakes

### ❌ Wrong: Revealing Too Early

```solidity
function vote(euint32 encryptedVote) external {
    total = FHE.add(total, encryptedVote);
    FHE.allow(total, address(0)); // Wrong: Revealing during voting!
}
```

### ✅ Correct: Reveal After Collection

```solidity
function vote(euint32 encryptedVote) external {
    require(!votingEnded, "Voting ended");
    total = FHE.add(total, encryptedVote);
    // Don't reveal yet
}

function endVoting() external {
    votingEnded = true;
    FHE.allow(total, address(0)); // ✅ Reveal after voting ends
}
```

## Security Considerations

1. **Timing**: Reveal results only after collection period
2. **Minimum Participation**: Ensure enough responses for anonymity
3. **Access Control**: Only authorized addresses can trigger revelation
4. **Immutability**: Results cannot be changed after revelation

## Performance

- Vote casting: ~50,000 gas
- Aggregation: ~30,000 gas per operation
- Public revelation: ~25,000 gas
- Total system: Efficient for most use cases

## Real-World Applications

### Governance
- DAO proposals
- Community votes
- Budget allocation
- Policy decisions

### Market Research
- Customer surveys
- Product feedback
- Satisfaction scores
- Trend analysis

### Finance
- Revenue aggregation
- Market statistics
- Trading volumes
- Performance metrics

## Next Steps

- Review [Encryption Pattern](encryption.md)
- Study [Access Control Pattern](access-control.md)
- Learn [User Decryption Pattern](user-decryption.md)

## References

- [Public Decryption Guide](https://docs.zama.ai/fhevm/fundamentals/decryption)
- [Voting System Patterns](https://docs.zama.ai/fhevm/examples/voting)
- [Aggregation Best Practices](https://docs.zama.ai/fhevm/security)

---

**Congratulations!** You've completed all 5 FHEVM pattern examples. Ready to build your own privacy-preserving application?

**Back to**: [Examples Overview](README.md) | [Quick Start Guide](../quick-start.md)
