# Encryption Pattern

## Overview

Demonstrates encrypted data structures and multiple encrypted types with FHE.

**Category**: `chapter: encryption`

## What You'll Learn

- ✅ Multiple encrypted data types (euint32, eaddress, ebool, euint64)
- ✅ Complex encrypted structures
- ✅ Data storage and retrieval patterns
- ✅ Batch operations on encrypted data

## Core Concepts

### Encrypted Data Types

```solidity
euint32  // Encrypted 32-bit unsigned integer
euint64  // Encrypted 64-bit unsigned integer
eaddress // Encrypted address
ebool    // Encrypted boolean
```

### Encrypted Structures

```solidity
struct EncryptedProfile {
    euint32 encryptedAge;
    eaddress encryptedWallet;
    ebool encryptedIsActive;
    euint64 encryptedBalance;
}
```

## Key Patterns

### Pattern 1: Basic Encryption

```solidity
// Store encrypted value
euint32 encryptedSecret = FHE.asEuint32(secretValue);
FHE.allowThis(encryptedSecret);
FHE.allow(encryptedSecret, msg.sender);
```

### Pattern 2: Complex Structures

```solidity
mapping(address => EncryptedProfile) profiles;

function createProfile(
    euint32 age,
    eaddress wallet,
    ebool isActive,
    euint64 balance
) external {
    profiles[msg.sender] = EncryptedProfile({
        encryptedAge: age,
        encryptedWallet: wallet,
        encryptedIsActive: isActive,
        encryptedBalance: balance
    });

    FHE.allow(age, msg.sender);
    FHE.allow(wallet, msg.sender);
    FHE.allow(isActive, msg.sender);
    FHE.allow(balance, msg.sender);
}
```

### Pattern 3: Batch Operations

```solidity
function batchStore(
    euint32[] calldata values
) external {
    for (uint256 i = 0; i < values.length; i++) {
        FHE.allowThis(values[i]);
        FHE.allow(values[i], msg.sender);
        encryptedData[msg.sender][i] = values[i];
    }
}
```

## Common Mistakes

### ❌ Wrong: Missing allowThis()

```solidity
function store(euint32 value) external {
    encryptedData = value; // Error: No allowThis!
}
```

### ✅ Correct: Grant Contract Permission

```solidity
function store(euint32 value) external {
    FHE.allowThis(value);  // ✅ Contract permission
    encryptedData = value;
}
```

## Use Cases

- **User Profiles**: Encrypted personal information
- **Financial Data**: Confidential account balances
- **Medical Records**: Encrypted patient data
- **Configuration**: Private settings and secrets

## Testing

```javascript
it("should store encrypted profile", async () => {
    const encrypted = await createEncryptedInput(
        contract,
        owner,
        age: 30,
        balance: 1000
    );

    await contract.createProfile(...encrypted.handles, encrypted.inputProof);
    // Verify storage (without revealing data)
});
```

## Next Steps

- Learn [Access Control Pattern](access-control.md)
- Study [Arithmetic Operations](arithmetic.md)
- Review [User Decryption](user-decryption.md)

## References

- [FHEVM Types](https://docs.zama.ai/fhevm/api/types)
- [Data Types Documentation](https://docs.zama.ai/fhevm/fundamentals/types)

---

**Continue Learning**: [Access Control Pattern →](access-control.md)
