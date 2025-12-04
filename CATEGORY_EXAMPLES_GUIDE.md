# FHEVM Category Examples Guide

This document provides detailed instructions for creating category-specific FHEVM examples from the template.

---

## Categories Overview

The Zama Bounty Track includes the following FHEVM pattern categories:

1. **Access Control** - FHE.allow(), FHE.allowTransient()
2. **Encryption** - euint32, eaddress encrypted data structures
3. **User Decryption** - Client-controlled decryption
4. **Public Decryption** - Public result decryption
5. **Arithmetic Operations** - FHE math (add, sub, mul, div, etc.)
6. **Input Validation** - Input proof verification
7. **Anti-Patterns** - Common mistakes to avoid
8. **Advanced Patterns** - Complex scenarios (auctions, escrow, etc.)

---

## Category 1: Access Control Example

### Overview
Demonstrates `FHE.allow()` and `FHE.allowTransient()` for controlling who can decrypt data.

### Smart Contract Template

**File**: `contracts/AccessControlExample.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FHEVM Example: Access Control Pattern
 *
 * Demonstrates:
 * - FHE.allow() - Grant permanent decryption access
 * - FHE.allowTransient() - Grant temporary decryption access
 * - Permission management
 * - Selective data visibility
 *
 * chapter: access-control
 */

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AccessControlExample is SepoliaConfig {
    address public admin;

    // Encrypted data with access controls
    mapping(uint256 => euint32) private secrets;
    mapping(uint256 => address) public dataOwners;
    mapping(uint256 => mapping(address => bool)) public accessGrants;

    event SecretStored(uint256 indexed id, address indexed owner);
    event AccessGranted(uint256 indexed id, address indexed grantee, bool transient);

    constructor() {
        admin = msg.sender;
    }

    /**
     * Store an encrypted secret and grant access to owner
     *
     * chapter: access-control
     *
     * Uses FHE.allow() to grant permanent decryption access to the secret owner
     */
    function storeSecret(uint256 _id, euint32 _secret) external {
        require(_id > 0, "Invalid ID");

        secrets[_id] = _secret;
        dataOwners[_id] = msg.sender;

        // Grant permanent access to owner
        FHE.allow(_secret, msg.sender);

        emit SecretStored(_id, msg.sender);
    }

    /**
     * Grant temporary access to a secret
     *
     * chapter: access-control
     *
     * Uses FHE.allowTransient() for one-time/temporary access
     */
    function grantTemporaryAccess(
        uint256 _id,
        address _grantee
    ) external {
        require(msg.sender == dataOwners[_id], "Only owner can grant access");

        euint32 secret = secrets[_id];
        FHE.allowTransient(secret, _grantee);

        emit AccessGranted(_id, _grantee, true);
    }

    /**
     * Grant permanent access to a secret
     *
     * chapter: access-control
     */
    function grantPermanentAccess(
        uint256 _id,
        address _grantee
    ) external {
        require(msg.sender == dataOwners[_id], "Only owner can grant access");

        euint32 secret = secrets[_id];
        FHE.allow(secret, _grantee);
        accessGrants[_id][_grantee] = true;

        emit AccessGranted(_id, _grantee, false);
    }

    /**
     * Retrieve secret (only accessible if access granted)
     *
     * chapter: access-control
     */
    function retrieveSecret(uint256 _id) external view returns (euint32) {
        require(
            msg.sender == dataOwners[_id] || accessGrants[_id][msg.sender],
            "Access denied"
        );
        return secrets[_id];
    }
}
```

### Test Suite Template

**File**: `test/AccessControlExample.test.js`

```javascript
/**
 * Test Suite: Access Control Pattern
 *
 * chapter: access-control
 *
 * Validates:
 * - FHE.allow() functionality
 * - FHE.allowTransient() behavior
 * - Permission enforcement
 * - Unauthorized access prevention
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Access Control Example", function () {
  let contract;
  let owner, addr1, addr2;

  /**
   * chapter: access-control
   *
   * Setup: Deploy contract and get signers
   */
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("AccessControlExample");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * chapter: access-control
   *
   * Test: FHE.allow() should grant permanent access
   *
   * Validates that FHE.allow() correctly grants decryption access
   */
  it("Should grant permanent access with FHE.allow()", async function () {
    const secretValue = 12345;
    const encryptedSecret = await ethers.encryptValue(secretValue);

    // Store secret with access granted to owner
    await contract.connect(owner).storeSecret(1, encryptedSecret);

    // Owner should be able to retrieve
    const retrieved = await contract.connect(owner).retrieveSecret(1);
    expect(retrieved).to.exist;
  });

  /**
   * chapter: access-control
   *
   * Test: Unauthorized access should be denied
   *
   * Validates that FHE.allow() prevents unauthorized decryption
   */
  it("Should deny access to unauthorized addresses", async function () {
    const secretValue = 12345;
    const encryptedSecret = await ethers.encryptValue(secretValue);

    await contract.connect(owner).storeSecret(1, encryptedSecret);

    // Unauthorized user should not be able to retrieve
    await expect(
      contract.connect(addr2).retrieveSecret(1)
    ).to.be.revertedWith("Access denied");
  });

  /**
   * chapter: access-control
   *
   * Test: FHE.allowTransient() should grant temporary access
   *
   * Validates temporary access granting
   */
  it("Should grant transient access", async function () {
    const secretValue = 12345;
    const encryptedSecret = await ethers.encryptValue(secretValue);

    await contract.connect(owner).storeSecret(2, encryptedSecret);
    await contract.connect(owner).grantTemporaryAccess(2, addr1.address);

    // Grantee should have temporary access
    const retrieved = await contract.connect(addr1).retrieveSecret(2);
    expect(retrieved).to.exist;
  });

  /**
   * chapter: access-control
   *
   * Test: Only owner can grant access
   *
   * Validates permission enforcement
   */
  it("Should prevent non-owner from granting access", async function () {
    const secretValue = 12345;
    const encryptedSecret = await ethers.encryptValue(secretValue);

    await contract.connect(owner).storeSecret(3, encryptedSecret);

    // Non-owner should not be able to grant access
    await expect(
      contract.connect(addr2).grantPermanentAccess(3, addr1.address)
    ).to.be.revertedWith("Only owner can grant access");
  });
});
```

### README Template

```markdown
# Access Control Pattern

**Category**: `access-control`

An FHEVM example demonstrating FHE-based access control using FHE.allow() and FHE.allowTransient().

## Overview

This example shows how to:
- Grant permanent decryption access with FHE.allow()
- Grant temporary decryption access with FHE.allowTransient()
- Enforce fine-grained access control
- Prevent unauthorized data access

## Key Concepts

### FHE.allow()
Permanently grants an address the ability to decrypt an encrypted value.

```solidity
FHE.allow(encryptedSecret, authorizedAddress);
```

### FHE.allowTransient()
Temporarily grants decryption access for a single transaction or limited time.

```solidity
FHE.allowTransient(encryptedSecret, temporaryAddress);
```

## Use Cases

- **Confidential Documents**: Grant access to specific users
- **Private Data Sharing**: Share encrypted data selectively
- **Tiered Permissions**: Different access levels
- **Temporary Access**: Time-limited or one-time access

## Testing

```bash
npm test
```

## Deployment

```bash
npm run deploy:sepolia
npm run verify:sepolia
```

---

See [Template Guide](../TEMPLATE_CUSTOMIZATION_GUIDE.md) for customization instructions.
```

---

## Category 2: Encryption Example

### Overview
Demonstrates data encryption using FHEVM encrypted types (euint32, eaddress, ebool).

### Smart Contract Template

```solidity
/**
 * FHEVM Example: Encryption Pattern
 *
 * Demonstrates:
 * - euint32: 32-bit encrypted unsigned integer
 * - eaddress: Encrypted Ethereum address
 * - ebool: Encrypted boolean value
 * - String encryption for text data
 *
 * chapter: encryption
 */

contract EncryptionExample is SepoliaConfig {
    // Encrypted data storage
    struct EncryptedRecord {
        euint32 encryptedValue;
        eaddress encryptedAddress;
        ebool encryptedFlag;
        string encryptedData;
        uint256 timestamp;
    }

    mapping(uint256 => EncryptedRecord) public records;

    /**
     * Store encrypted data
     *
     * chapter: encryption
     */
    function storeEncryptedData(
        uint256 _id,
        euint32 _value,
        eaddress _address,
        ebool _flag,
        string calldata _data
    ) external {
        records[_id] = EncryptedRecord({
            encryptedValue: _value,
            encryptedAddress: _address,
            encryptedFlag: _flag,
            encryptedData: _data,
            timestamp: block.timestamp
        });
    }

    /**
     * Retrieve encrypted record
     *
     * chapter: encryption
     */
    function getEncryptedRecord(uint256 _id)
        external
        view
        returns (EncryptedRecord memory)
    {
        return records[_id];
    }
}
```

---

## Category 3: User Decryption Example

### Overview
Demonstrates user-controlled decryption where only the client can decrypt their data.

### Key Pattern

```solidity
/**
 * FHEVM Example: User Decryption
 *
 * Demonstrates:
 * - Client holds private key
 * - Smart contract can't decrypt
 * - Selective data reveal
 * - Privacy-preserving queries
 *
 * chapter: user-decryption
 */

contract UserDecryptionExample is SepoliaConfig {
    mapping(address => euint32) private userSecrets;

    /**
     * User stores encrypted secret
     *
     * Only user holds the decryption key
     */
    function storeMySecret(euint32 _secret) external {
        userSecrets[msg.sender] = _secret;
        FHE.allow(_secret, msg.sender); // Only I can decrypt
    }

    /**
     * User can decrypt their own data
     */
    function getMySecret() external view returns (euint32) {
        return userSecrets[msg.sender];
    }
}
```

---

## Category 4: Public Decryption Example

### Overview
Demonstrates public computation results that can be viewed in plaintext.

### Key Pattern

```solidity
/**
 * FHEVM Example: Public Decryption
 *
 * Demonstrates:
 * - Compute on encrypted data
 * - Publish encrypted result
 * - Anyone can decrypt specific results
 * - Privacy-preserving aggregation
 *
 * chapter: public-decryption
 */

contract PublicDecryptionExample is SepoliaConfig {
    euint32 public totalSum; // Encrypted aggregate

    /**
     * Add to encrypted sum
     */
    function addToSum(uint32 _value) external {
        euint32 encrypted = FHE.asEuint32(_value);
        totalSum = FHE.add(totalSum, encrypted);
    }

    /**
     * Get total (can be decrypted publicly)
     */
    function getTotal() external view returns (euint32) {
        return totalSum;
    }
}
```

---

## Category 5: Arithmetic Operations Example

### Overview
Demonstrates FHE arithmetic: add, sub, mul, div, rem, etc.

### Key Pattern

```solidity
/**
 * FHEVM Example: Arithmetic Operations
 *
 * Demonstrates:
 * - FHE.add(a, b)
 * - FHE.sub(a, b)
 * - FHE.mul(a, b)
 * - FHE.div(a, b)
 * - FHE.rem(a, b)
 *
 * chapter: arithmetic
 */

contract ArithmeticExample is SepoliaConfig {
    /**
     * Add two encrypted numbers
     */
    function add(euint32 a, euint32 b) external pure returns (euint32) {
        return FHE.add(a, b);
    }

    /**
     * Subtract encrypted numbers
     */
    function subtract(euint32 a, euint32 b) external pure returns (euint32) {
        return FHE.sub(a, b);
    }

    /**
     * Multiply encrypted numbers
     */
    function multiply(euint32 a, euint32 b) external pure returns (euint32) {
        return FHE.mul(a, b);
    }

    /**
     * Compare encrypted numbers
     */
    function areEqual(euint32 a, euint32 b) external pure returns (ebool) {
        return FHE.eq(a, b);
    }
}
```

---

## Testing Best Practices

Every category example should include:

### 1. Deployment Tests
```javascript
it("Should deploy successfully", async () => {
  expect(contract.address).to.not.equal(ethers.ZeroAddress);
});
```

### 2. Feature Tests
```javascript
it("Should demonstrate category feature", async () => {
  // Test specific FHE capability
});
```

### 3. Edge Case Tests
```javascript
it("Should handle edge cases", async () => {
  // Test boundary conditions
});
```

### 4. Security Tests
```javascript
it("Should enforce access control", async () => {
  // Test security properties
});
```

---

## Naming Conventions

**Important**: Follow naming conventions to avoid conflicts:

✅ **Good Names**:
- `fhe-access-control-example`
- `fhe-encryption-tutorial`
- `fhe-arithmetic-patterns`
- `fhe-confidential-voting`

❌ **Avoid**:
- `` (dapp + number)
- `` (case + number)
- `` ( reference)

---

## Submission Checklist

For each category example:

- [ ] Smart contract implements target category
- [ ] Minimum 20 test cases
- [ ] 80%+ code coverage
- [ ] README with examples
- [ ] Deployed to Sepolia
- [ ] Verified on Etherscan
- [ ] CI/CD passing
- [ ] No security vulnerabilities
- [ ] Demo video prepared

---

## Resources

### Documentation
- [FHEVM API Reference](https://docs.zama.ai/fhevm/api)
- [Zama Examples](https://github.com/zama-ai/fhevm-examples)
- [Hardhat Documentation](https://hardhat.org/)

### FHE Concepts
- [FHE Overview](https://docs.zama.ai/fhevm/overview)
- [FHEVM Architecture](https://docs.zama.ai/fhevm/architecture)

---

## Next Steps

1. Choose your category
2. Use template above to create smart contract
3. Implement comprehensive tests
4. Update README with examples
5. Deploy and verify
6. Create demo video
7. Submit to Bounty Track

---

*Version*: 1.0.0
*License*: MIT
