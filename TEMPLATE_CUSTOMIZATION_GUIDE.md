# FHEVM Example Template Customization Guide

This guide explains how to use this repository as a template to create category-specific FHEVM examples for the Zama Bounty Track.

---

## Overview

This project serves as a **production-ready template** for creating FHEVM example repositories. You can:

1. Clone this template
2. Customize the smart contract for your FHE pattern
3. Adapt the test suite
4. Update documentation
5. Submit as your Bounty Track entry

---

## Template Usage Workflow

### Step 1: Clone the Template

```bash
# Clone this repository
git clone https://github.com/[your-org]/FHELegalConsultation.git my-fhe-example
cd my-fhe-example

# Create new git repository for your example
rm -rf .git
git init
git branch -m main
```

### Step 2: Customize Project Metadata

Edit `package.json`:

```json
{
  "name": "fhe-access-control-example",
  "description": "FHEVM Example: Access Control Pattern - Demonstrates FHE.allow() and FHE.allowTransient()",
  "keywords": [
    "fhevm",
    "access-control",
    "fhe.allow",
    "homomorphic-encryption",
    "privacy"
  ]
}
```

### Step 3: Replace Smart Contract

Edit `contracts/AnonymousLegalConsultation.sol`:

**Before**:
```solidity
contract AnonymousLegalConsultation is SepoliaConfig {
    // Legal consultation logic
}
```

**After** (example for access-control):
```solidity
/**
 * FHEVM Example: Access Control Pattern
 *
 * Demonstrates FHE.allow() and FHE.allowTransient()
 *
 * chapter: access-control
 */
contract AccessControlExample is SepoliaConfig {
    // Your FHE access control logic
}
```

### Step 4: Update Test Suite

Edit `test/AnonymousLegalConsultation.test.js`:

```javascript
/**
 * Test Suite: Access Control Pattern
 *
 * Validates:
 * - FHE.allow() functionality
 * - FHE.allowTransient() behavior
 * - Access control enforcement
 * - Edge cases
 *
 * chapter: access-control
 */
describe("Access Control Pattern", function () {
  /**
   * chapter: access-control
   *
   * Test: FHE.allow() should grant access
   */
  it("Should grant access with FHE.allow()", async function () {
    // Your test
  });
});
```

### Step 5: Update Documentation

Edit `README.md` with your example:

```markdown
# Access Control Pattern

**Category**: `access-control`

An FHEVM example demonstrating the FHE.allow() and FHE.allowTransient() patterns.

## Features

- **FHE.allow()**: Grant permanent access to encrypted data
- **FHE.allowTransient()**: Grant temporary access
- **Access Control**: Enforce authorization
- **Privacy Preservation**: Encrypt sensitive data

## Architecture

[Your diagram]

## Usage

[Your usage examples]
```

### Step 6: Test Your Example

```bash
npm install
npm run compile
npm test
npm run gas
npm run deploy:sepolia
```

---

## Category Templates

This template can be adapted for any FHEVM category from the Bounty Track:

### 1. Access Control Pattern

**Files to modify**:
- `contracts/AccessControl.sol` - Implement FHE.allow(), FHE.allowTransient()
- `test/AccessControl.test.js` - Test authorization patterns
- `README.md` - Explain access control concepts

**Key FHE Functions**:
```solidity
FHE.allow(encryptedValue, msg.sender);
FHE.allowTransient(encryptedValue, address);
```

### 2. Encryption Pattern

**Files to modify**:
- `contracts/Encryption.sol` - Implement euint32, eaddress encryption
- `test/Encryption.test.js` - Test encryption/decryption cycles
- `README.md` - Explain encryption techniques

**Key FHE Types**:
```solidity
euint32 encrypted;
euint64 encrypted64;
eaddress encryptedAddress;
ebool encryptedBoolean;
```

### 3. User Decryption Pattern

**Files to modify**:
- `contracts/UserDecryption.sol` - Implement user-controlled decryption
- `test/UserDecryption.test.js` - Test decryption access control
- `README.md` - Explain user-controlled privacy

**Key Pattern**:
```solidity
// Only authorized user can decrypt
FHE.allow(encryptedData, authorizedUser);
// User has private key to decrypt locally
```

### 4. Public Computation Pattern

**Files to modify**:
- `contracts/PublicComputation.sol` - Implement homomorphic operations
- `test/PublicComputation.test.js` - Test arithmetic on encrypted values
- `README.md` - Explain public computation

**Key Operations**:
```solidity
// Operations on encrypted values
euint32 result = FHE.add(a, b);
ebool isEqual = FHE.eq(a, b);
euint32 max = FHE.max(a, b);
```

### 5. Arithmetic Operations Pattern

**Files to modify**:
- `contracts/Arithmetic.sol` - Implement FHE arithmetic
- `test/Arithmetic.test.js` - Test mathematical operations
- `README.md` - Explain arithmetic patterns

**Key Operations**:
```solidity
FHE.add(a, b)
FHE.sub(a, b)
FHE.mul(a, b)
FHE.div(a, b)
FHE.rem(a, b)
```

---

## Project Structure Template

Each example should maintain this structure:

```
fhe-[category]-example/
├── contracts/
│   └── [Category]Example.sol           # Main contract with your FHE logic
│
├── test/
│   └── [Category]Example.test.js       # Comprehensive tests with TSDoc
│
├── scripts/
│   ├── deploy.js                       # Deployment (usually unchanged)
│   ├── verify.js                       # Verification (usually unchanged)
│   ├── interact.js                     # Interaction CLI (optional)
│   └── simulate.js                     # Workflow simulation (optional)
│
├── hardhat.config.js                   # Multi-network config (unchanged)
├── package.json                        # Update name and description
├── .env.example                        # Environment template (unchanged)
├── README.md                           # Your documentation
├── LICENSE                             # MIT License
└── BOUNTY_TRACK_ALIGNMENT.md           # Bounty requirements checklist
```

---

## Documentation Best Practices

### 1. JSDoc/TSDoc Annotations

Add chapter markers to tests:

```javascript
/**
 * chapter: access-control
 *
 * Test description explaining the FHE concept
 * being demonstrated.
 *
 * This test validates:
 * - Specific behavior 1
 * - Specific behavior 2
 * - Edge case handling
 */
it("Should demonstrate behavior", async function () {
  // Test implementation
});
```

### 2. README Structure

```markdown
# [Example Name]

**Category**: `[category]`

Brief description

## Features
- Feature 1
- Feature 2

## Architecture

[Diagram or explanation]

## Usage

[Code examples]

## Testing

[Test commands]

## Resources

[Links to documentation]
```

### 3. Code Comments

```solidity
/**
 * FHEVM Example: [Category]
 *
 * Demonstrates the [Category] pattern for FHE smart contracts.
 *
 * chapter: [category]
 */
contract YourExample is SepoliaConfig {
    /**
     * Your function with detailed explanation
     *
     * This demonstrates how to:
     * - Use FHE operations
     * - Maintain privacy
     * - Enforce access control
     *
     * @param encryptedValue The encrypted input
     * @return The encrypted result
     */
    function yourFunction(euint32 encryptedValue)
        external
        returns (euint32)
    {
        // Implementation with inline comments explaining FHE usage
    }
}
```

---

## Configuration Files

### hardhat.config.js

The template includes multi-network configuration:

```javascript
networks: {
  hardhat: { chainId: 31337 },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111
  },
  zama: {
    url: process.env.ZAMA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 9000
  }
}
```

No changes needed unless you add custom compiler options.

### .env.example

```env
# Network Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_RPC_URL=https://devnet.zama.ai

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Gas Reporting
REPORT_GAS=true
```

No changes needed.

---

## Testing Requirements

Your example must include:

### 1. Deployment Tests

```javascript
describe("Deployment", function () {
  it("Should deploy successfully", async function () {
    // Verify deployment
  });

  it("Should initialize correctly", async function () {
    // Verify initial state
  });
});
```

### 2. Feature Tests

```javascript
describe("[Category] Features", function () {
  it("Should demonstrate primary feature", async function () {
    // Test main functionality
  });

  it("Should demonstrate secondary feature", async function () {
    // Test supporting functionality
  });
});
```

### 3. Access Control Tests

```javascript
describe("Access Control", function () {
  it("Should restrict unauthorized access", async function () {
    // Test permission checks
  });

  it("Should allow authorized access", async function () {
    // Test successful access
  });
});
```

### 4. Edge Case Tests

```javascript
describe("Edge Cases", function () {
  it("Should handle boundary conditions", async function () {
    // Test limits and edge cases
  });

  it("Should handle invalid inputs", async function () {
    // Test error handling
  });
});
```

### 5. Integration Tests

```javascript
describe("Integration", function () {
  it("Should complete full workflow", async function () {
    // Test end-to-end scenario
  });
});
```

**Minimum**: 20 test cases
**Recommended**: 40+ test cases
**Excellent**: 60+ test cases

---

## Deployment Workflow

### Local Testing

```bash
npm install
npm run compile
npm test
npm run gas
npm run deploy:localhost
```

### Sepolia Testnet

```bash
cp .env.example .env
# Edit .env with your credentials

npm run deploy:sepolia
npm run verify:sepolia
npm run interact:sepolia
npm run simulate:sepolia
```

### Zama Devnet

```bash
npm run deploy:zama
# Interact with Zama deployment
npm run interact:zama
```

---

## Quality Gates

Before submission, ensure:

- ✅ `npm run compile` - Compiles without errors
- ✅ `npm test` - All tests pass
- ✅ `npm run test:coverage` - 80%+ coverage
- ✅ `npm run gas` - Gas usage acceptable
- ✅ `npm run lint` - No linting errors
- ✅ `npm run format:check` - Code is formatted
- ✅ `npm run security` - No security issues

---

## Submission Checklist

Before submitting to Bounty Track:

- [ ] Project name follows naming conventions (no dapp+numbers, , case+numbers)
- [ ] Smart contract demonstrates clear FHE concept
- [ ] Minimum 20 test cases (40+ recommended)
- [ ] 80%+ code coverage
- [ ] README with clear examples
- [ ] All tests passing
- [ ] Deployed to Sepolia testnet
- [ ] Verified on Etherscan
- [ ] Demo video prepared
- [ ] Documentation generated/updated
- [ ] CI/CD pipeline passing
- [ ] No security vulnerabilities (npm audit clean)

---

## Example Submissions

### Access Control Example

```
fhe-access-control-example/
├── README.md                           # Explains FHE.allow()
├── contracts/AccessControlExample.sol  # Implements FHE.allow()
├── test/AccessControl.test.js          # Tests authorization
└── [standard config files]
```

### Encryption Example

```
fhe-encryption-example/
├── README.md                           # Explains euint32, eaddress
├── contracts/EncryptionExample.sol     # Implements encryption patterns
├── test/Encryption.test.js             # Tests encrypt/decrypt cycles
└── [standard config files]
```

### Decryption Example

```
fhe-decryption-example/
├── README.md                           # Explains user decryption
├── contracts/DecryptionExample.sol     # Implements decryption patterns
├── test/Decryption.test.js             # Tests decryption access
└── [standard config files]
```

---

## Resources

### Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [FHE.sol API](https://docs.zama.ai/fhevm/api)
- [Hardhat Guide](https://hardhat.org/)
- [Solidity Docs](https://soliditylang.org/)

### Examples in This Template
- `contracts/AnonymousLegalConsultation.sol` - Complete contract example
- `test/AnonymousLegalConsultation.test.js` - Comprehensive test suite
- `README.md` - Detailed documentation example

### GitHub Resources
- [Zama Repositories](https://github.com/zama-ai)
- [FHEVM Examples](https://github.com/zama-ai/fhevm-examples)

---

## Common Customization Patterns

### Pattern 1: Simple Arithmetic

```solidity
contract ArithmeticExample is SepoliaConfig {
    function add(euint32 a, euint32 b) external pure returns (euint32) {
        return FHE.add(a, b);
    }
}
```

### Pattern 2: Access Control

```solidity
contract AccessExample is SepoliaConfig {
    mapping(uint256 => euint32) private secrets;

    function storeSecret(uint256 id, euint32 secret) external {
        secrets[id] = secret;
        FHE.allow(secret, msg.sender);
    }
}
```

### Pattern 3: Conditional Logic

```solidity
contract ConditionalExample is SepoliaConfig {
    function compare(euint32 a, euint32 b) external pure returns (ebool) {
        return FHE.eq(a, b);
    }
}
```

### Pattern 4: Storage & Retrieval

```solidity
contract StorageExample is SepoliaConfig {
    euint32 private encryptedValue;

    function store(euint32 value) external {
        encryptedValue = value;
    }

    function retrieve() external view returns (euint32) {
        return encryptedValue;
    }
}
```

---

## Troubleshooting

### Tests failing?
- Ensure `npm install` completed successfully
- Check network configuration in `.env`
- Verify Solidity version: 0.8.24+

### Deployment failing?
- Check wallet has sufficient ETH on testnet
- Verify RPC URL is correct
- Check private key is valid

### Linting errors?
- Run `npm run format` to auto-fix
- Check ESLint and Solhint configurations

### Gas too high?
- Review contract for inefficiencies
- Check loop bounds
- Optimize storage access

---

## Next Steps

1. Clone this template
2. Choose your FHEVM category
3. Customize smart contract
4. Write comprehensive tests
5. Update documentation
6. Deploy to Sepolia
7. Record demo video
8. Submit to Bounty Track

---

## Support

For questions about:
- **FHEVM**: See [Zama Documentation](https://docs.zama.ai/fhevm)
- **Hardhat**: See [Hardhat Docs](https://hardhat.org/)
- **This Template**: Check README.md and BOUNTY_TRACK_ALIGNMENT.md

---

*Template Version*: 1.0.0
*Last Updated*: January 2025
*License*: MIT
