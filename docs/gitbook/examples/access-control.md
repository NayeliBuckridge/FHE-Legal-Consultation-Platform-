# Access Control Pattern

## Overview

Demonstrates FHE.allow() and FHE.allowTransient() for controlling encrypted data access in privacy-preserving smart contracts.

**Category**: `chapter: access-control`

## What You'll Learn

- ✅ Granting permanent decryption access with `FHE.allow()`
- ✅ Granting temporary access with `FHE.allowTransient()`
- ✅ Permission management without revealing data
- ✅ Selective data visibility patterns
- ✅ Access revocation strategies

## The Problem

In traditional smart contracts, all data stored on the blockchain is publicly visible. This makes it impossible to build applications requiring data privacy while still maintaining selective access control.

## The Solution

FHEVM provides encrypted data types and permission functions that allow:
- Storing encrypted data on-chain
- Granting decryption access to specific users
- Revoking access when needed
- All without revealing the underlying data

## Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AccessControlExample is SepoliaConfig {
    address public admin;

    // Encrypted data structures
    struct EncryptedFile {
        euint32 encryptedContent;
        eaddress encryptedOwner;
        uint256 timestamp;
        bool isPublic;
    }

    mapping(uint256 => EncryptedFile) private files;
    mapping(uint256 => mapping(address => bool)) public accessGranted;

    /**
     * Upload encrypted file and grant permanent access
     */
    function uploadFile(euint32 _encryptedContent, bool _isPublic)
        external returns (uint256)
    {
        fileCounter++;
        uint256 fileId = fileCounter;

        files[fileId] = EncryptedFile({
            encryptedContent: _encryptedContent,
            encryptedOwner: FHE.asEaddress(msg.sender),
            timestamp: block.timestamp,
            isPublic: _isPublic
        });

        // ✅ Grant permanent access to owner
        FHE.allow(_encryptedContent, msg.sender);
        accessGranted[fileId][msg.sender] = true;

        // ✅ Public files: allow anyone to decrypt
        if (_isPublic) {
            FHE.allow(_encryptedContent, address(0));
        }

        emit FileUploaded(fileId, msg.sender);
        return fileId;
    }

    /**
     * Grant temporary access to specific user
     */
    function grantTemporaryAccess(uint256 _fileId, address _user) external {
        require(accessGranted[_fileId][msg.sender], "Not authorized");

        // ✅ Grant temporary access (only for this transaction)
        FHE.allowTransient(files[_fileId].encryptedContent, _user);
        temporaryAccess[_fileId][_user] = true;

        emit AccessGranted(_fileId, _user, false);
    }

    /**
     * Grant permanent access to specific user
     */
    function grantPermanentAccess(uint256 _fileId, address _user) external {
        require(accessGranted[_fileId][msg.sender], "Not authorized");

        // ✅ Grant permanent access
        FHE.allow(files[_fileId].encryptedContent, _user);
        accessGranted[_fileId][_user] = true;

        emit AccessGranted(_fileId, _user, true);
    }
}
```

## Key Patterns

### ✅ Permanent Access with FHE.allow()

```solidity
// Grant permanent decryption access
FHE.allow(encryptedData, userAddress);

// Access persists across transactions
// User can decrypt anytime
```

**Use Cases**:
- File ownership
- Permanent sharing
- Role-based permissions

### ✅ Temporary Access with FHE.allowTransient()

```solidity
// Grant temporary access (this transaction only)
FHE.allowTransient(encryptedData, temporaryUser);

// Access expires after transaction
// Useful for one-time operations
```

**Use Cases**:
- Temporary sharing
- Single-use permissions
- Time-limited access

### ✅ Public Decryption

```solidity
// Allow anyone to decrypt
FHE.allow(encryptedData, address(0));

// Useful for public results while keeping inputs private
```

**Use Cases**:
- Voting results
- Auction winners
- Aggregated statistics

## Common Patterns

### Pattern 1: File Sharing

```solidity
function shareFile(uint256 fileId, address recipient) external {
    // Verify ownership
    require(isOwner(fileId, msg.sender), "Not owner");

    // Grant access
    FHE.allow(files[fileId].encryptedContent, recipient);
    accessGranted[fileId][recipient] = true;
}
```

### Pattern 2: Access Revocation

```solidity
function revokeAccess(uint256 fileId, address user) external {
    require(isOwner(fileId, msg.sender), "Not owner");

    // Note: Cannot revoke FHE permissions directly
    // Mark as revoked in contract state
    accessGranted[fileId][user] = false;

    emit AccessRevoked(fileId, user);
}
```

### Pattern 3: Batch Access Control

```solidity
function grantBatchAccess(uint256 fileId, address[] calldata users) external {
    require(isOwner(fileId, msg.sender), "Not owner");

    for (uint256 i = 0; i < users.length; i++) {
        FHE.allow(files[fileId].encryptedContent, users[i]);
        accessGranted[fileId][users[i]] = true;
    }
}
```

## Common Mistakes

### ❌ Missing allowThis()

```solidity
// WRONG: Contract can't use encrypted value
function process(euint32 data) external {
    euint32 result = FHE.add(data, otherData);
    FHE.allow(result, msg.sender); // Missing allowThis!
}

// CORRECT: Grant contract permission first
function process(euint32 data) external {
    euint32 result = FHE.add(data, otherData);
    FHE.allowThis(result);           // ✅ Contract permission
    FHE.allow(result, msg.sender);   // ✅ User permission
}
```

### ❌ Using View Functions with Encrypted Returns

```solidity
// WRONG: View functions can't return encrypted values
function getData() public view returns (euint32) {
    return encryptedData; // Error!
}

// CORRECT: Make it a regular function
function getData() public returns (euint32) {
    FHE.allow(encryptedData, msg.sender);
    return encryptedData;
}
```

### ❌ Forgetting Input Proofs

```solidity
// WRONG: No input proof verification
function submit(bytes calldata encryptedInput) external {
    euint32 data = FHE.asEuint32(encryptedInput); // Unsafe!
}

// CORRECT: Verify input proof
function submit(
    bytes calldata encryptedInput,
    bytes calldata inputProof
) external {
    euint32 data = FHE.fromExternal(encryptedInput, inputProof); // ✅ Safe
}
```

## Testing

```javascript
describe("Access Control Pattern", () => {
    let contract, owner, user1, user2;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();
        contract = await deployContract("AccessControlExample");
    });

    it("should grant permanent access", async () => {
        // Upload file
        const tx = await contract.uploadFile(encryptedData, false);
        const receipt = await tx.wait();
        const fileId = receipt.events[0].args.fileId;

        // Grant access to user1
        await contract.grantPermanentAccess(fileId, user1.address);

        // Verify access granted
        expect(await contract.accessGranted(fileId, user1.address)).to.be.true;
    });

    it("should grant temporary access", async () => {
        const tx = await contract.uploadFile(encryptedData, false);
        const fileId = 1;

        // Grant temporary access
        await contract.grantTemporaryAccess(fileId, user1.address);

        // Access is transient (only during transaction)
        expect(await contract.temporaryAccess(fileId, user1.address)).to.be.true;
    });
});
```

## Use Cases

### Medical Records
- Store encrypted patient data
- Grant access to specific doctors
- Revoke access when treatment ends
- Ensure privacy compliance

### Legal Documents
- Confidential contract storage
- Selective sharing with parties
- Temporary access for reviewers
- Audit trail without revealing content

### Financial Data
- Encrypted transaction history
- Account access control
- Temporary auditor access
- Privacy-preserving compliance

## Security Considerations

### Best Practices

1. **Always verify ownership before granting access**
   ```solidity
   require(isOwner(fileId, msg.sender), "Not authorized");
   ```

2. **Use events for audit trails**
   ```solidity
   emit AccessGranted(fileId, user, permanent);
   ```

3. **Validate user addresses**
   ```solidity
   require(user != address(0), "Invalid address");
   ```

4. **Consider gas costs for batch operations**
   ```solidity
   require(users.length <= MAX_BATCH_SIZE, "Batch too large");
   ```

## Running This Example

### Prerequisites
- Node.js 18+ or 20+
- Hardhat installed
- Basic understanding of Solidity

### Steps

```bash
# Clone repository
git clone <repository-url>
cd FHELegalConsultation

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:sepolia
```

## Next Steps

- Explore [Encryption Patterns](encryption.md)
- Learn [Arithmetic Operations](arithmetic.md)
- Study [User Decryption](user-decryption.md)
- Review [Public Decryption](public-decryption.md)

## References

- [FHEVM Access Control](https://docs.zama.ai/fhevm/fundamentals/permissions)
- [FHE.allow() Documentation](https://docs.zama.ai/fhevm/api/functions#allow)
- [Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)

---

**Ready to implement?** Start with the [Quick Start Guide](../quick-start.md)!
