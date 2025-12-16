# Arithmetic Operations

## Overview

Demonstrates FHE arithmetic operations on encrypted values (add, sub, mul, eq, etc.).

**Category**: `chapter: arithmetic`

## What You'll Learn

- ✅ Addition and subtraction on encrypted values
- ✅ Multiplication and division operations
- ✅ Comparison operations (eq, gte, lt, min, max)
- ✅ Compound calculations
- ✅ Statistical operations

## Operations

### Arithmetic Operations

```solidity
euint32 sum = FHE.add(a, b);      // Addition
euint32 diff = FHE.sub(a, b);     // Subtraction
euint32 prod = FHE.mul(a, b);     // Multiplication
euint32 quot = FHE.div(a, b);     // Division
```

### Comparison Operations

```solidity
ebool equal = FHE.eq(a, b);       // Equality
ebool notEqual = FHE.ne(a, b);    // Not equal
ebool greater = FHE.gt(a, b);     // Greater than
ebool greaterOrEqual = FHE.gte(a, b);  // Greater or equal
ebool less = FHE.lt(a, b);        // Less than
ebool lessOrEqual = FHE.lte(a, b);// Less or equal
```

### Utility Operations

```solidity
euint32 minimum = FHE.min(a, b);  // Minimum
euint32 maximum = FHE.max(a, b);  // Maximum
```

## Key Patterns

### Pattern 1: Financial Calculations

```solidity
function calculateInterest(
    euint64 principal,
    euint32 rate
) external returns (euint64) {
    // interest = principal * rate / 100
    euint64 interest = FHE.mul(principal, rate);
    euint64 result = FHE.div(interest, 100);
    FHE.allowThis(result);
    return result;
}
```

### Pattern 2: Comparisons

```solidity
function verifyMinimumBalance(
    euint64 balance,
    euint64 minimumRequired
) external returns (ebool) {
    ebool isValid = FHE.gte(balance, minimumRequired);
    FHE.allowThis(isValid);
    return isValid;
}
```

### Pattern 3: Compound Operations

```solidity
function complexCalculation(
    euint32 a,
    euint32 b,
    euint32 c
) external returns (euint32) {
    // (a + b) * c
    euint32 sum = FHE.add(a, b);
    euint32 result = FHE.mul(sum, c);
    FHE.allowThis(result);
    return result;
}
```

## Common Mistakes

### ❌ Wrong: Missing allowThis() on Results

```solidity
function add(euint32 a, euint32 b) external returns (euint32) {
    euint32 result = FHE.add(a, b);
    return result; // Error: Missing allowThis!
}
```

### ✅ Correct: Grant Contract Permission

```solidity
function add(euint32 a, euint32 b) external returns (euint32) {
    euint32 result = FHE.add(a, b);
    FHE.allowThis(result);  // ✅ Contract permission
    FHE.allow(result, msg.sender); // ✅ User permission
    return result;
}
```

## Use Cases

- **Financial Calculations**: Interest, payments, balances
- **Statistical Analysis**: Averages, min/max values
- **Voting Systems**: Vote counting, comparisons
- **Verification**: Without revealing data

## Testing

```javascript
it("should calculate sum correctly", async () => {
    const a = 100;
    const b = 50;

    const encrypted = await createEncryptedInput(contract, owner, a, b);
    const result = await contract.add(
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.inputProof
    );

    // Verify result is 150 (without decryption revealing value)
});
```

## Performance Considerations

- Addition/Subtraction: ~50,000 gas
- Multiplication: ~75,000 gas
- Comparison: ~60,000 gas
- Batch operations: Plan accordingly

## Next Steps

- Learn [User Decryption Pattern](user-decryption.md)
- Study [Public Decryption](public-decryption.md)
- Review [Access Control](access-control.md)

## References

- [FHEVM Operations](https://docs.zama.ai/fhevm/api/operations)
- [Arithmetic Guide](https://docs.zama.ai/fhevm/fundamentals/operations)

---

**Continue Learning**: [User Decryption →](user-decryption.md)
