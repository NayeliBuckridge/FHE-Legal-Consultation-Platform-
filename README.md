# FHEVM Examples - 5 Privacy-Preserving Patterns

This directory contains five comprehensive examples demonstrating the essential Fully Homomorphic Encryption patterns for building privacy-preserving smart contracts.

---

## 📚 Examples Overview

### 1. Access Control Pattern
**File**: `contracts/AccessControlExample.sol`

Demonstrates how to control who can decrypt encrypted data using `FHE.allow()` and `FHE.allowTransient()`.

**Key Concepts**:
- Grant permanent decryption access with `FHE.allow()`
- Grant temporary access with `FHE.allowTransient()`
- Revoke access and manage permissions
- Batch grant access to multiple users

**Use Cases**:
- Confidential document sharing
- Private data access control
- Selective information reveal
- Time-limited access systems

**Functions**:
```solidity
uploadFile(euint32 _encryptedContent, bool _isPublic)
grantTemporaryAccess(uint256 _fileId, address _user)
grantPermanentAccess(uint256 _fileId, address _user)
revokeAccess(uint256 _fileId, address _user)
getFileContent(uint256 _fileId)
hasAccess(uint256 _fileId, address _user)
uploadSharedDocument(euint32 _encryptedContent, address[] _users)
batchGrantAccess(uint256 _fileId, address[] _users)
```

**Code Lines**: 350+

---

### 2. Encryption Pattern
**File**: `contracts/EncryptionExample.sol`

Demonstrates how to work with different encrypted data types in smart contracts.

**Encrypted Types**:
- `euint32` - 32-bit encrypted unsigned integer
- `euint64` - 64-bit encrypted unsigned integer
- `euint8` - 8-bit encrypted unsigned integer
- `eaddress` - Encrypted Ethereum address
- `ebool` - Encrypted boolean value

**Key Concepts**:
- Create encrypted data structures
- Store multiple encrypted types
- Work with encrypted wallet addresses
- Handle encrypted status flags

**Use Cases**:
- User profile encryption
- Transaction data privacy
- Score and rating systems
- Status flag management

**Functions**:
```solidity
updateProfile(euint32 _age, eaddress _wallet, ebool _isActive, euint64 _balance, euint8 _status)
createTransaction(euint32 _amount, eaddress _from, eaddress _to, string _notes)
completeTransaction(uint256 _transactionId)
setEncryptedScore(address _user, euint32 _score)
setEncryptedFlag(address _user, ebool _flag)
getProfile(address _user)
getTransaction(uint256 _transactionId)
getEncryptedScore(address _user)
getEncryptedFlag(address _user)
batchUpdate(address _user, euint32 _score, ebool _flag)
compareEncryptedValues(euint32 _value1, euint32 _value2)
```

**Code Lines**: 400+

---

### 3. Arithmetic Operations Pattern
**File**: `contracts/ArithmeticExample.sol`

Demonstrates computation on encrypted values without decryption.

**FHE Operations**:
- `FHE.add(a, b)` - Addition
- `FHE.sub(a, b)` - Subtraction
- `FHE.mul(a, b)` - Multiplication
- `FHE.div(a, b)` - Division
- `FHE.rem(a, b)` - Modulo/Remainder
- `FHE.min(a, b)` - Minimum
- `FHE.max(a, b)` - Maximum
- `FHE.eq(a, b)` - Equality comparison

**Key Concepts**:
- Perform math on encrypted values
- Compare encrypted numbers
- Calculate statistics on private data
- Compound calculations

**Use Cases**:
- Financial calculations (interest, transfers)
- Statistical analysis (average, variance)
- Voting systems (encrypted tallying)
- Encrypted banking operations

**Functions**:
```solidity
add(euint32 _a, euint32 _b)
subtract(euint32 _a, euint32 _b)
multiply(euint32 _a, euint32 _b)
divide(euint32 _a, euint32 _b)
remainder(euint32 _a, euint32 _b)
minimum(euint32 _a, euint32 _b)
maximum(euint32 _a, euint32 _b)
areEqual(euint32 _a, euint32 _b)
addToSum(euint32 _value)
multiplyProduct(euint32 _value)
calculateCompoundInterest(euint32 _principal, uint256 _rate, uint256 _periods)
calculateAverage(euint32[] _values)
calculateVariance(euint32[] _values)
deposit(euint32 _amount)
withdraw(euint32 _amount)
batchOperations(euint32[] _values)
```

**Code Lines**: 500+

---

### 4. User Decryption Pattern
**File**: `contracts/UserDecryptionExample.sol`

Demonstrates how users maintain control of their private data with only they holding decryption keys.

**Key Concepts**:
- User encrypts data client-side
- Only user can decrypt their data
- Contract cannot decrypt private information
- Selective data sharing with permissions
- Privacy-preserving verification

**Use Cases**:
- Private medical records
- Confidential financial data
- Personal identity information
- Sensitive user credentials
- Privacy-preserving credit checks

**Functions**:
```solidity
storePrivateData(euint32 _creditScore, euint32 _income, ebool _isEmployed, euint32 _age, string _medicalRecord)
storeHealthData(euint32 _heartRate, euint32 _bloodPressure, euint32 _weight, ebool _hasConditions, string _notes)
storeFinancialData(euint32 _balance, euint32 _creditLimit, euint32 _monthlyExpenses, ebool _hasCreditIssues)
grantAccess(address _to, string _dataType)
revokeAccess(string _dataType)
getMyPrivateData()
getMyHealthData()
getMyFinancialData()
verifyMinimumAge(address _user, uint32 _minimumAge)
verifyCreditScore(address _user, uint32 _minimumScore)
hasData(address _user)
getDataTimestamp(address _user)
compareIncomeToThreshold(uint32 _threshold)
checkEmploymentStatus()
```

**Code Lines**: 400+

---

### 5. Public Decryption Pattern
**File**: `contracts/PublicDecryptionExample.sol`

Demonstrates how to compute on private data while publishing results that anyone can decrypt.

**Key Concepts**:
- Aggregate encrypted data privately
- Publish aggregated results for public decryption
- Voting on encrypted data
- Public financial statistics
- Transparent governance without revealing details

**Use Cases**:
- Encrypted voting systems
- Privacy-preserving polling
- Confidential financial reporting
- Anonymous statistics
- Public auditing with privacy

**Functions**:
```solidity
castVote(euint32 _encryptedChoice, euint32 _encryptedWeight)
createPoll(string _question, uint256 _duration)
voteInPoll(uint256 _pollId, euint32 _option)
addDeposit(euint32 _amount)
addWithdrawal(euint32 _amount)
incrementActiveUsers()
addPlatformRevenue(euint64 _amount)
getPollResults(uint256 _pollId)
getTotalVoteWeight()
getPlatformRevenue()
getFinancialAggregation()
calculateNetFlow()
closePoll(uint256 _pollId)
batchAddDeposits(euint32[] _amounts)
resetFinancialAggregation()
getSummaryStatistics()
```

**Code Lines**: 400+

---

## 🧪 Testing Examples

### Access Control Tests
**File**: `test/AccessControlExample.test.js`

Comprehensive test suite for access control patterns:
- File upload and initialization
- Access grant and revocation
- Temporary vs permanent access
- Batch operations
- Edge cases and security

**Test Count**: 15+ test cases

**Example Tests**:
```javascript
describe("Deployment", ...)
describe("File Upload", ...)
describe("Access Control", ...)
describe("Access Revocation", ...)
describe("Batch Operations", ...)
describe("Edge Cases", ...)
describe("Integration", ...)
```

---

## 🚀 How to Use These Examples

### 1. Study Individual Patterns

```bash
# Read the specific contract
cat contracts/AccessControlExample.sol

# Understand the pattern by reading comments
# Look for "chapter: access-control" markers
```

### 2. Run the Tests

```bash
# Copy test file to main test directory
cp test/AccessControlExample.test.js ../test/

# Run the specific test
npm test -- --grep "Access Control"
```

### 3. Deploy a Single Example

```bash
# Copy contract to main contracts directory
cp contracts/AccessControlExample.sol ../contracts/

# Update hardhat.config.js to compile it
npm run compile

# Deploy
npm run deploy:sepolia
```

### 4. Combine Patterns

Mix and match patterns to build complex applications:

```solidity
// Combine Access Control + Arithmetic
contract ComplexExample {
    // Access control for data
    mapping(address => euint32) private encryptedBalance;

    // Arithmetic operations
    function transfer(address to, euint32 amount) external {
        euint32 newBalance = FHE.sub(encryptedBalance[msg.sender], amount);
        encryptedBalance[msg.sender] = newBalance;

        // Access control for transfer
        FHE.allow(newBalance, msg.sender);
    }
}
```

---

## 📊 Pattern Comparison

| Pattern | Complexity | Privacy Level | Use Cases |
|---------|-----------|---------------|-----------|
| **Access Control** | Medium | Very High | Document sharing, permission management |
| **Encryption** | Medium | Very High | Data storage, user profiles |
| **Arithmetic** | High | High | Calculations, analytics |
| **User Decryption** | Medium | Highest | Personal data, medical records |
| **Public Decryption** | High | High | Aggregation, voting, statistics |

---

## 🎯 Learning Path

### For Beginners
1. Start with **Encryption Pattern** - Understand data types
2. Learn **Access Control Pattern** - Understand permissions
3. Study **Arithmetic Pattern** - Understand operations

### For Intermediate
1. Review **User Decryption Pattern** - Understand privacy models
2. Study **Public Decryption Pattern** - Understand aggregation
3. Combine patterns - Build complex applications

### For Advanced
1. Analyze all 5 patterns
2. Combine multiple patterns
3. Design new privacy-preserving applications
4. Optimize for gas efficiency

---

## 💡 Key Concepts

### FHE.allow() vs FHE.allowTransient()

```solidity
// Permanent access - user can always decrypt
FHE.allow(encryptedData, user);

// Temporary access - only for this transaction
FHE.allowTransient(encryptedData, user);

// Public decryption - anyone can decrypt
FHE.allow(encryptedData, address(0));
```

### Encrypted Types

```solidity
euint32 encryptedNumber;   // 32-bit encrypted int
euint64 largeNumber;       // 64-bit encrypted int
eaddress encryptedAddress; // Encrypted address
ebool encryptedFlag;       // Encrypted boolean
```

### Common Operations

```solidity
// Arithmetic
euint32 sum = FHE.add(a, b);
euint32 product = FHE.mul(a, b);

// Comparison
ebool isEqual = FHE.eq(a, b);
ebool isGreater = FHE.gte(a, b);

// Access
FHE.allow(encryptedData, user);
FHE.allowTransient(encryptedData, user);
```

---

## 📖 Documentation

Each example contract includes:
- Detailed comments explaining each function
- JSDoc/TSDoc annotations
- Chapter markers for documentation generation
- Inline examples and explanations

---

## 🔗 Related Resources

### Documentation Files
- [CATEGORY_EXAMPLES_GUIDE.md](../CATEGORY_EXAMPLES_GUIDE.md) - Detailed category explanations
- [TEMPLATE_CUSTOMIZATION_GUIDE.md](../TEMPLATE_CUSTOMIZATION_GUIDE.md) - How to customize examples
- [docs/gitbook/concepts.md](../docs/gitbook/concepts.md) - FHEVM concepts

### Main Project
- [README.md](../README.md) - Main project documentation
- [TESTING.md](../TESTING.md) - Testing guide
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide

### External Resources
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [FHE.sol API](https://docs.zama.ai/fhevm/api)
- [GitHub Examples](https://github.com/zama-ai/fhevm-examples)

---

## 📝 File Summary

| File | Lines | Type | Difficulty |
|------|-------|------|------------|
| AccessControlExample.sol | 350+ | Contract | Medium |
| EncryptionExample.sol | 400+ | Contract | Easy |
| ArithmeticExample.sol | 500+ | Contract | Hard |
| UserDecryptionExample.sol | 400+ | Contract | Medium |
| PublicDecryptionExample.sol | 400+ | Contract | Hard |
| AccessControlExample.test.js | 200+ | Test | Medium |

**Total Code**: 1,500+ lines
**Patterns Demonstrated**: 5
**Test Cases**: 15+

---

## 🎓 Learning Outcomes

After studying these examples, you will understand:

✅ How to store encrypted data in smart contracts
✅ How to control access to private information
✅ How to perform computations on encrypted values
✅ How to build privacy-preserving applications
✅ FHE patterns and best practices
✅ FHEVM security considerations
✅ Gas optimization techniques
✅ Testing encrypted smart contracts

---

## 🚀 Next Steps

1. **Study One Pattern** - Pick a pattern and understand it thoroughly
2. **Run the Tests** - Execute tests locally to see patterns in action
3. **Modify Examples** - Change values and see how behavior changes
4. **Build Your Own** - Create a new application combining patterns
5. **Deploy to Testnet** - Try deploying to Sepolia
6. **Submit to Bounty** - Use these examples for Bounty Track

---

## 📞 Questions?

- **FHEVM Questions** → [Zama Docs](https://docs.zama.ai/fhevm)
- **Pattern Questions** → See inline comments in contracts
- **Testing Questions** → [TESTING.md](../TESTING.md)
- **Deployment Questions** → [DEPLOYMENT.md](../DEPLOYMENT.md)

---

## 📄 License

All examples are licensed under MIT License.

---

**Start learning privacy-preserving smart contracts today!** 🔐

*These examples are production-ready and can be used as templates for your own FHEVM applications.*