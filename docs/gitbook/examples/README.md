# Examples Overview

This section contains detailed examples demonstrating various FHEVM patterns and use cases for privacy-preserving smart contracts.

## Available Examples

### 1. [Encryption Pattern](encryption.md)

**Category**: `encryption`

Shows encrypted data structures and multiple encrypted types with FHE.

**What You'll Learn**:
- Multiple encrypted data types (euint32, eaddress, ebool, euint64)
- Complex encrypted structures
- Data storage and retrieval patterns
- Batch operations on encrypted data

[View Example →](encryption.md)

---

### 2. [Access Control Pattern](access-control.md)

**Category**: `access-control`

Demonstrating FHE.allow() and FHE.allowTransient() for controlling encrypted data access.

**What You'll Learn**:
- FHE.allow() for permanent decryption access
- FHE.allowTransient() for temporary access
- Permission management patterns
- Selective data visibility

[View Example →](access-control.md)

---

### 3. [Arithmetic Operations](arithmetic.md)

**Category**: `arithmetic`

FHE arithmetic operations on encrypted values (add, sub, mul, eq, etc.).

**What You'll Learn**:
- Addition, subtraction on encrypted values
- Multiplication and division
- Comparison operations (eq, gte, lt)
- Min/max operations
- Compound calculations

[View Example →](arithmetic.md)

---

### 4. [User Decryption Pattern](user-decryption.md)

**Category**: `user-decryption`

User-controlled privacy where only the user holds decryption keys.

**What You'll Learn**:
- Private data storage patterns
- User-only decryption
- Privacy-preserving verification
- Medical/financial data privacy
- Temporary access granting

[View Example →](user-decryption.md)

---

### 5. [Public Decryption Pattern](public-decryption.md)

**Category**: `public-decryption`

Aggregating encrypted data with public result decryption.

**What You'll Learn**:
- Encrypted voting systems
- Privacy-preserving polling
- Confidential aggregation
- Public statistics with privacy
- Transparent governance

[View Example →](public-decryption.md)

---

## Learning Path

We recommend following this order for learning FHEVM patterns:

1. **[Encryption Pattern](encryption.md)** ⭐ Beginner
   - Start with basic encryption concepts
   - Understand encrypted data types
   - Learn data storage patterns

2. **[Access Control](access-control.md)** ⭐⭐ Intermediate
   - Master permission management
   - Learn FHE.allow() patterns
   - Understand access revocation

3. **[Arithmetic Operations](arithmetic.md)** ⭐⭐ Intermediate
   - Perform calculations on encrypted data
   - Learn comparison operations
   - Build complex computations

4. **[User Decryption](user-decryption.md)** ⭐⭐⭐ Advanced
   - Implement user-controlled privacy
   - Build privacy-preserving apps
   - Handle sensitive data

5. **[Public Decryption](public-decryption.md)** ⭐⭐⭐ Advanced
   - Create transparent systems
   - Aggregate encrypted data
   - Build voting/polling systems

## Quick Reference

| Pattern | Use Case | Difficulty | Key Concepts |
|---------|----------|------------|--------------|
| **Encryption** | Basic encrypted storage | ⭐ Beginner | euint32, eaddress, ebool |
| **Access Control** | Permission management | ⭐⭐ Intermediate | FHE.allow(), FHE.allowTransient() |
| **Arithmetic** | Encrypted calculations | ⭐⭐ Intermediate | FHE.add(), FHE.eq(), FHE.mul() |
| **User Decryption** | Private user data | ⭐⭐⭐ Advanced | User-only access |
| **Public Decryption** | Public aggregation | ⭐⭐⭐ Advanced | Public results |

## Pattern Comparison

### When to Use Each Pattern

**Encryption Pattern** - Use when you need:
- Store sensitive data on-chain
- Multiple encrypted data types
- Basic encrypted structures
- Privacy-first storage

**Access Control Pattern** - Use when you need:
- Selective data sharing
- Role-based permissions
- Temporary access grants
- Permission management

**Arithmetic Pattern** - Use when you need:
- Calculations on encrypted data
- Comparison without decryption
- Statistical operations
- Financial computations

**User Decryption Pattern** - Use when you need:
- User-controlled privacy
- Private medical/financial records
- Personal data storage
- Self-sovereign data

**Public Decryption Pattern** - Use when you need:
- Transparent voting results
- Public statistics
- Aggregated data
- Open governance

## Common Use Cases

### Healthcare
- **Encryption**: Store patient records
- **Access Control**: Doctor permissions
- **User Decryption**: Patient privacy
- **Arithmetic**: Health statistics
- **Public Decryption**: Anonymous surveys

### Finance
- **Encryption**: Account balances
- **Access Control**: Auditor access
- **Arithmetic**: Interest calculations
- **User Decryption**: Private transactions
- **Public Decryption**: Market statistics

### Governance
- **Encryption**: Encrypted proposals
- **Access Control**: Committee access
- **Arithmetic**: Vote counting
- **User Decryption**: Private voting
- **Public Decryption**: Final results

### Legal
- **Encryption**: Confidential documents
- **Access Control**: Client-lawyer sharing
- **User Decryption**: Party access only
- **Arithmetic**: Case statistics
- **Public Decryption**: Court records

## Code Examples

### Basic Encryption
```solidity
euint32 encryptedValue = FHE.asEuint32(123);
FHE.allowThis(encryptedValue);
```

### Access Control
```solidity
FHE.allow(encryptedData, authorizedUser);
FHE.allowTransient(encryptedData, temporaryUser);
```

### Arithmetic
```solidity
euint32 sum = FHE.add(encryptedA, encryptedB);
ebool isEqual = FHE.eq(encryptedA, encryptedB);
```

### User Decryption
```solidity
mapping(address => euint32) private userData;
FHE.allow(userData[user], user);
```

### Public Decryption
```solidity
euint32 totalVotes = FHE.add(votes[0], votes[1]);
FHE.allow(totalVotes, address(0)); // Public result
```

## Testing Examples

Each pattern includes comprehensive tests:

```bash
# Run all example tests
npm test

# Run specific example
npx hardhat test test/AccessControlExample.test.js
npx hardhat test test/EncryptionExample.test.js
npx hardhat test test/ArithmeticExample.test.js
```

## Performance Considerations

### Gas Costs
- Encryption operations: ~45,000 gas
- FHE.allow(): ~30,000 gas
- FHE arithmetic: ~50,000-100,000 gas
- Complex operations: ~150,000+ gas

### Optimization Tips
1. Batch operations when possible
2. Minimize FHE operations
3. Cache encrypted results
4. Use events instead of storage

## Security Best Practices

1. **Always use input proofs**
   ```solidity
   euint32 data = FHE.fromExternal(input, inputProof);
   ```

2. **Grant contract permissions**
   ```solidity
   FHE.allowThis(encryptedValue);
   ```

3. **Validate user access**
   ```solidity
   require(hasAccess(user), "Unauthorized");
   ```

4. **Use proper error handling**
   ```solidity
   require(value != 0, "Invalid value");
   ```

## Additional Resources

### Documentation
- [FHEVM Concepts](../concepts.md) - Core concepts
- [Quick Start Guide](../quick-start.md) - Getting started
- [Architecture Overview](../architecture.md) - System design

### External Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm) - Official docs
- [FHEVM Examples](https://github.com/zama-ai/fhevm-examples) - More examples
- [Hardhat Documentation](https://hardhat.org/) - Framework docs

### Community
- [Zama Discord](https://discord.gg/zama) - Community support
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions) - Q&A
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/) - Technical help

## Getting Help

Need assistance with the examples?

1. Check the specific example page
2. Review [Troubleshooting Guide](../troubleshooting.md)
3. Ask on [Zama Discord](https://discord.gg/zama)
4. Open an issue on GitHub

## Contributing

Want to add more examples?

1. Follow the [Contributing Guide](../contributing.md)
2. Use existing patterns as templates
3. Include comprehensive tests
4. Add clear documentation

---

## Next Steps

Ready to dive in?

1. **Start Learning**: Begin with [Encryption Pattern](encryption.md)
2. **Run Examples**: Execute `npm test` to see examples in action
3. **Deploy Contracts**: Try `npm run deploy:sepolia`
4. **Build Your Own**: Use examples as templates for your project

**Let's build privacy-preserving applications together!** 🔐

---

*For complete project setup, see [Quick Start Guide](../quick-start.md)*
