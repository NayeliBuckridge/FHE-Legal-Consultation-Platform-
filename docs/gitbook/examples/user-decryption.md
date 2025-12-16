# User Decryption Pattern

## Overview

User-controlled privacy where only the user holds decryption keys.

**Category**: `chapter: user-decryption`

## What You'll Learn

- ✅ Private data storage patterns
- ✅ User-only decryption
- ✅ Privacy-preserving verification
- ✅ Medical/financial data privacy
- ✅ Temporary access granting

## Core Concept

Users maintain complete control over who can decrypt their data. The smart contract stores encrypted data but cannot decrypt it without user permission.

## Key Patterns

### Pattern 1: Private Data Storage

```solidity
mapping(address => euint32) private userData;

function storePrivateData(euint32 encryptedData) external {
    // Only caller can decrypt
    userData[msg.sender] = encryptedData;
    FHE.allow(encryptedData, msg.sender);
}

function retrievePrivateData() external returns (euint32) {
    euint32 data = userData[msg.sender];
    FHE.allow(data, msg.sender);
    return data;
}
```

### Pattern 2: Privacy-Preserving Verification

```solidity
function verifyMinimumAge(
    address user,
    euint32 minimumAge
) external returns (ebool) {
    euint32 age = userData[user];

    // Verify age without revealing actual age
    ebool result = FHE.gte(age, minimumAge);
    FHE.allowThis(result);
    FHE.allow(result, user);
    return result;
}
```

### Pattern 3: Temporary Access Granting

```solidity
function grantTemporaryAccess(
    address recipient,
    uint256 duration
) external {
    euint32 myData = userData[msg.sender];

    // Grant temporary access
    FHE.allowTransient(myData, recipient);

    // Store access with expiry
    temporaryAccess[msg.sender][recipient] = block.timestamp + duration;
}
```

## Use Cases

### Medical Records
```solidity
struct EncryptedMedicalRecord {
    euint32 bloodPressure;
    euint32 cholesterol;
    ebool hasCondition;
}

mapping(address => EncryptedMedicalRecord) medicalData;

function storeMedicalRecord(
    euint32 bp,
    euint32 chol,
    ebool condition
) external {
    medicalData[msg.sender] = EncryptedMedicalRecord({
        bloodPressure: bp,
        cholesterol: chol,
        hasCondition: condition
    });

    // User has exclusive access
    FHE.allow(bp, msg.sender);
    FHE.allow(chol, msg.sender);
    FHE.allow(condition, msg.sender);
}
```

### Financial Data
```solidity
mapping(address => euint64) accountBalance;

function setBalance(euint64 encryptedBalance) external {
    // Only user can see their balance
    accountBalance[msg.sender] = encryptedBalance;
    FHE.allow(encryptedBalance, msg.sender);
}

function getBalance() external returns (euint64) {
    euint64 balance = accountBalance[msg.sender];
    FHE.allow(balance, msg.sender);
    return balance;
}
```

## Security Considerations

### Best Practices

1. **Always grant user permission immediately**
   ```solidity
   FHE.allow(encryptedData, msg.sender);
   ```

2. **Verify access before operations**
   ```solidity
   require(hasAccess(user), "Unauthorized");
   ```

3. **Use temporary access for sensitive operations**
   ```solidity
   FHE.allowTransient(data, temporaryUser);
   ```

4. **Log access events**
   ```solidity
   emit DataAccessed(user, timestamp);
   ```

## Testing

```javascript
it("should store and retrieve private data", async () => {
    const encrypted = await createEncryptedInput(
        contract,
        owner,
        secretValue
    );

    // Store
    await contract.storePrivateData(
        encrypted.handles[0],
        encrypted.inputProof
    );

    // Retrieve (only owner can)
    const result = await contract.connect(owner).retrievePrivateData();
    expect(result).to.exist;

    // Other users cannot retrieve
    await expect(
        contract.connect(user1).retrievePrivateData()
    ).to.be.revertedWith("Unauthorized");
});
```

## Privacy Guarantees

✅ **What's Protected**:
- Actual data values
- Encrypted content
- Decryption keys
- Access history details

⚠️ **What's Public**:
- Transaction metadata
- User addresses
- Data existence
- Access grant events

## Common Mistakes

### ❌ Wrong: Granting Contract Permission

```solidity
function getData() external {
    euint32 data = userData[msg.sender];
    // Missing user permission!
    FHE.allowThis(data);
}
```

### ✅ Correct: Granting Both Permissions

```solidity
function getData() external returns (euint32) {
    euint32 data = userData[msg.sender];
    FHE.allowThis(data);        // Contract permission
    FHE.allow(data, msg.sender); // User permission
    return data;
}
```

## Regulatory Compliance

This pattern helps with:
- **GDPR**: User-controlled data
- **HIPAA**: Medical data privacy
- **CCPA**: Privacy rights
- **SOC 2**: Data protection controls

## Next Steps

- Learn [Public Decryption Pattern](public-decryption.md)
- Study [Access Control Pattern](access-control.md)
- Review [Arithmetic Operations](arithmetic.md)

## References

- [User Privacy Patterns](https://docs.zama.ai/fhevm/fundamentals/privacy)
- [Data Protection Best Practices](https://docs.zama.ai/fhevm/security)

---

**Continue Learning**: [Public Decryption →](public-decryption.md)
