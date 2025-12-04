# FHEVM Concepts

This chapter explains the core concepts of Fully Homomorphic Encryption on Ethereum Virtual Machine (FHEVM) and how they apply to building privacy-preserving smart contracts.

## What is FHEVM?

FHEVM is a technology that allows computation on encrypted data without decrypting it first. This means:

- **Data stays encrypted** while being processed
- **Smart contracts** can perform operations on sensitive information
- **Privacy is maintained** even during computation
- **Results** can be selectively decrypted

### Traditional vs FHE Approach

**Traditional Blockchain**:
```
Input → Plain Data → Computation → Plain Result
❌ All data visible on-chain
❌ No privacy for sensitive information
❌ Trust issues with data exposure
```

**FHEVM Blockchain**:
```
Input → Encrypted Data → Computation → Encrypted Result → Selective Decryption
✅ Data remains private
✅ Computation on encrypted values
✅ Selective decryption access
✅ Zero-knowledge possibilities
```

## FHE Data Types

### euint32 (Encrypted Unsigned Integer)
32-bit encrypted unsigned integer (0 to 2^32 - 1)

```solidity
// Create encrypted values
euint32 encryptedNumber = FHE.asEuint32(123);
euint32 encryptedFromInput = _encryptedInput; // From function parameter

// Operations
euint32 sum = FHE.add(encryptedNumber1, encryptedNumber2);
euint32 product = FHE.mul(encryptedNumber1, encryptedNumber2);
```

### euint64 (Encrypted Unsigned Integer)
64-bit encrypted unsigned integer for larger values

```solidity
euint64 largeNumber = FHE.asEuint64(123456789);
euint64 balance = _encryptedBalance;
```

### ebool (Encrypted Boolean)
Encrypted boolean value (true/false)

```solidity
ebool encryptedFlag = FHE.asEbool(true);
ebool result = FHE.eq(encryptedValue1, encryptedValue2);
```

### eaddress (Encrypted Address)
Encrypted Ethereum address

```solidity
eaddress encryptedUser = FHE.asEaddress(msg.sender);
eaddress encryptedRecipient = _encryptedAddress;
```

## FHE Operations

### Arithmetic Operations

```solidity
// Addition
euint32 sum = FHE.add(a, b);

// Subtraction
euint32 difference = FHE.sub(a, b);

// Multiplication
euint32 product = FHE.mul(a, b);

// Division
euint32 quotient = FHE.div(a, b);

// Modulo (remainder)
euint32 remainder = FHE.rem(a, b);
```

### Comparison Operations

```solidity
// Equality comparison
ebool isEqual = FHE.eq(a, b);

// Greater than or equal
ebool isGreaterOrEqual = FHE.gte(a, b);

// Minimum
euint32 minimum = FHE.min(a, b);

// Maximum
euint32 maximum = FHE.max(a, b);
```

### Access Control Operations

```solidity
// Grant permanent decryption access
FHE.allow(encryptedData, authorizedAddress);

// Grant temporary access (single transaction)
FHE.allowTransient(encryptedData, temporaryAddress);

// Allow anyone to decrypt
FHE.allow(encryptedData, address(0));
```

## FHE Patterns

### 1. Encrypted Storage Pattern

Store sensitive data in encrypted form:

```solidity
struct EncryptedProfile {
    euint32 encryptedAge;
    euint32 encryptedScore;
    ebool encryptedIsActive;
}

mapping(address => EncryptedProfile) private profiles;

function updateProfile(euint32 _age, euint32 _score) external {
    profiles[msg.sender] = EncryptedProfile({
        encryptedAge: _age,
        encryptedScore: _score,
        encryptedIsActive: FHE.asEbool(true)
    });
}
```

### 2. Access Control Pattern

Control who can decrypt data:

```solidity
mapping(uint256 => mapping(address => bool)) accessGranted;

function grantAccess(uint256 _dataId, address _user) external {
    require(msg.sender == dataOwner[_dataId], "Not owner");
    FHE.allow(encryptedData[_dataId], _user);
    accessGranted[_dataId][_user] = true;
}
```

### 3. Computation on Encrypted Data

Perform operations without decryption:

```solidity
function calculateEncryptedScore(
    euint32 _baseScore,
    euint32 _bonus
) external pure returns (euint32) {
    return FHE.add(_baseScore, _bonus);
}
```

### 4. Selective Decryption

Control what can be decrypted:

```solidity
// Private data (only owner can decrypt)
mapping(address => euint32) private secret;

// Public aggregate (anyone can decrypt)
euint32 public encryptedTotal;

function addSecret(euint32 _secret) external {
    secret[msg.sender] = _secret;
    FHE.allow(_secret, msg.sender); // Only owner

    encryptedTotal = FHE.add(encryptedTotal, _secret);
    FHE.allow(encryptedTotal, address(0)); // Anyone
}
```

## Security Considerations

### Access Control

Always control who can decrypt:

```solidity
// ✅ Good: Grant access explicitly
FHE.allow(encryptedData, authorizedUser);

// ❌ Bad: Don't allow everyone by default
// FHE.allow(encryptedData, address(0)); // Only for public data
```

### Input Validation

Validate inputs even when encrypted:

```solidity
function transfer(euint32 _amount) external {
    // Check user has sufficient balance
    ebool hasBalance = FHE.gte(balances[msg.sender], _amount);
    require(FHE.decrypt(hasBalance), "Insufficient balance");

    balances[msg.sender] = FHE.sub(balances[msg.sender], _amount);
}
```

### Gas Optimization

FHE operations consume more gas:

```solidity
// ✅ Good: Batch operations when possible
function batchUpdate(euint32[] calldata _values) external {
    euint32 sum = FHE.asEuint32(0);
    for (uint i = 0; i < _values.length; i++) {
        sum = FHE.add(sum, _values[i]);
    }
    return sum;
}

// ❌ Avoid: Too many individual operations
```

## Common Use Cases

### 1. Private Voting
```solidity
euint32 public encryptedVotes;
mapping(address => bool) hasVoted;

function vote(euint32 _choice) external {
    require(!hasVoted[msg.sender], "Already voted");
    encryptedVotes = FHE.add(encryptedVotes, _choice);
    hasVoted[msg.sender] = true;
}
```

### 2. Confidential Financial Data
```solidity
struct EncryptedTransaction {
    euint32 amount;
    eaddress from;
    eaddress to;
}

mapping(uint256 => EncryptedTransaction) private transactions;
```

### 3. Private Medical Records
```solidity
struct MedicalRecord {
    euint32 patientId;
    euint32 encryptedAge;
    ebool encryptedHasCondition;
    // ...
}
```

### 4. Reputation Systems
```solidity
mapping(address => euint32) private encryptedReputation;

function updateReputation(euint32 _newScore) external {
    encryptedReputation[msg.sender] = _newScore;
    FHE.allow(_newScore, msg.sender);
}
```

## Performance Characteristics

### Gas Costs

FHE operations are computationally expensive:

| Operation | Relative Gas Cost | Notes |
|-----------|------------------|-------|
| FHE.add() | Medium | 2x regular addition |
| FHE.mul() | High | 10x regular multiplication |
| FHE.eq() | High | Comparison is expensive |
| FHE.allow() | Low | Access control is cheap |

### Execution Time

- **Encrypted computations** take longer than plaintext
- **Network latency** can be higher
- **Block size** may need adjustment

### Best Practices

1. **Minimize FHE operations**
   - Batch when possible
   - Cache results
   - Use simpler operations

2. **Optimize data structures**
   - Use smaller data types
   - Avoid unnecessary fields
   - Consider gas costs

3. **Plan for scalability**
   - Design with limits
   - Consider off-chain computation
   - Use efficient algorithms

## Limitations

### Current FHEVM Limitations

1. **Limited Data Types**
   - No floating-point numbers
   - No large integer arrays
   - No string operations on-chain

2. **Performance**
   - Slower than plaintext operations
   - Higher gas costs
   - Longer transaction times

3. **Debugging**
   - Cannot inspect encrypted values easily
   - Need special testing approaches
   - Limited debugging tools

### Workarounds

1. **For Floating Point**
   ```solidity
   // Represent as integer with scaling
   euint32 price = FHE.asEuint32(12345); // $123.45 (2 decimal places)
   ```

2. **For Large Arrays**
   ```solidity
   // Use Merkle trees or other compression
   bytes32 merkleRoot; // Store commitment
   // Process elements individually
   ```

3. **For Debugging**
   ```solidity
   // Decrypt in tests only
   uint256 debugValue = FHE.decrypt(encryptedValue);
   // Use test-only functions
   ```

## Migration from Traditional Smart Contracts

### Key Changes

1. **Data Types**
   ```solidity
   // Before
   uint32 public score;

   // After
   euint32 private encryptedScore;
   ```

2. **Access Control**
   ```solidity
   // Before
   function getScore(address user) external view returns (uint32) {
       return scores[user];
   }

   // After
   function getScore(address user) external view returns (euint32) {
       FHE.allow(encryptedScores[user], msg.sender);
       return encryptedScores[user];
   }
   ```

3. **Operations**
   ```solidity
   // Before
   uint32 newScore = oldScore + bonus;

   // After
   euint32 newScore = FHE.add(oldScore, bonus);
   ```

## Testing FHE Contracts

### Special Testing Considerations

1. **Encryption in Tests**
   ```javascript
   const encryptedValue = await ethers.encryptValue(123);
   await contract.function(encryptedValue);
   ```

2. **Decryption in Tests**
   ```javascript
   const encryptedResult = await contract.result();
   const result = await ethers.decryptValue(encryptedResult);
   ```

3. **Access Control Testing**
   ```javascript
   // Test with different users
   await contract.connect(user1).grantAccess(otherUser);

   // Verify access is granted
   await contract.connect(otherUser).function(); // Should work
   await contract.connect(thirdUser).function(); // Should fail
   ```

## Resources

### Official Documentation
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHE.sol API Reference](https://docs.zama.ai/fhevm/api)
- [FHEVM Examples](https://github.com/zama-ai/fhevm-examples)

### Learning Resources
- [FHE Concepts Explained](https://docs.zama.ai/fhevm/overview)
- [Best Practices Guide](https://docs.zama.ai/fhevm/best-practices)
- [Security Considerations](https://docs.zama.ai/fhevm/security)

### Community
- [Zama Discord](https://discord.gg/zama)
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/fhevm)

---

## Summary

FHEVM enables a new paradigm of privacy-preserving smart contracts where:

- **Data stays encrypted** throughout computation
- **Access is controlled** through FHE.allow() mechanisms
- **Computation is possible** without revealing data
- **Privacy is preserved** while maintaining transparency

The patterns and concepts covered here form the foundation for building sophisticated privacy-preserving applications on blockchain.

---

*Ready to build with FHEVM? Check out our [Examples](examples/README.md) to see these concepts in action!* 🚀