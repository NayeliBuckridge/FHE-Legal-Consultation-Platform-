# Architecture Overview

## System Design

The FHE Legal Consultation Platform is built on a modular architecture that separates concerns across multiple layers:

```
┌─────────────────────────────────────┐
│    Frontend (Web Interface)          │
│  - React Components                 │
│  - Form Handling                    │
│  - User Interaction                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Smart Contract Layer             │
│  - Solidity Contracts               │
│  - FHE Operations                   │
│  - State Management                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Blockchain Network               │
│  - Ethereum (Sepolia)               │
│  - Zama Network                     │
│  - Local Hardhat Node               │
└─────────────────────────────────────┘
```

## Component Organization

### 1. Smart Contracts (`/contracts`)

**Main Contract**: `AnonymousLegalConsultation.sol`
- Handles all legal consultation logic
- Manages user roles (Client, Lawyer, Admin)
- Stores encrypted data
- Implements FHE operations

**Example Contracts** (`/examples/contracts`)
- `AccessControlExample.sol` - Permission management patterns
- `EncryptionExample.sol` - Data encryption patterns
- `ArithmeticExample.sol` - Arithmetic operations on encrypted data
- `UserDecryptionExample.sol` - User-controlled privacy
- `PublicDecryptionExample.sol` - Public aggregation patterns

### 2. Tests (`/test`)

**Test Structure**:
```
test/
├── AnonymousLegalConsultation.test.js  (75+ test cases)
└── examples/
    ├── AccessControlExample.test.js
    ├── EncryptionExample.test.js
    ├── ArithmeticExample.test.js
    ├── UserDecryptionExample.test.js
    └── PublicDecryptionExample.test.js
```

**Test Categories**:
- Deployment & Initialization
- Lawyer Registration
- Consultation Submission
- Admin Functions
- Lawyer Response
- View Functions
- Integration Tests
- Edge Cases
- Gas Optimization

### 3. Automation Scripts (`/scripts`)

#### `create-fhevm-example.ts`
Generates standalone example repositories:
```bash
ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
```

**Features**:
- Validates project names
- Copies contract and test files
- Generates deployment scripts
- Updates package.json
- Creates README documentation

#### `create-fhevm-category.ts`
Generates projects with multiple examples:
```bash
ts-node scripts/create-fhevm-category.ts <category> [output-dir]
```

**Categories Available**:
- `legal` - Complete legal consultation examples
- `access-control` - Access control patterns
- `encryption` - Encryption patterns
- `arithmetic` - Arithmetic operations
- `user-decryption` - User decryption patterns
- `public-decryption` - Public decryption patterns

#### `generate-docs.ts`
Generates GitBook documentation:
```bash
ts-node scripts/generate-docs.ts --all
```

### 4. Documentation (`/docs/gitbook`)

**Structure**:
```
docs/gitbook/
├── README.md              # Introduction
├── SUMMARY.md             # Table of Contents
├── concepts.md            # FHEVM concepts
├── quick-start.md         # Getting started
├── architecture.md        # This file
├── testing.md             # Testing guide
├── deployment.md          # Deployment guide
├── security.md            # Security practices
├── troubleshooting.md     # Common issues
├── contributing.md        # Contributing guide
├── resources.md           # External resources
└── examples/              # Generated example docs
    ├── README.md
    ├── access-control.md
    ├── encryption.md
    ├── arithmetic.md
    ├── user-decryption.md
    └── public-decryption.md
```

## Data Flow

### Consultation Submission Flow

```
1. Client submits encrypted question
   ↓
2. Smart contract receives input with input proof
   ↓
3. FHE.fromExternal() decrypts using proof
   ↓
4. Contract stores encrypted data
   ↓
5. Admin assigns to suitable lawyer
   ↓
6. Lawyer provides encrypted response
   ↓
7. Client decrypts response using their key
```

### Encryption Pattern

```
Client Input
    ↓
Encrypt (Client's Private Key)
    ↓
Generate Input Proof
    ↓
Submit to Contract
    ↓
Contract Verifies Proof
    ↓
Contract Stores Encrypted Value
    ↓
Grant Decryption Permissions
    ↓
User/Client Can Decrypt
```

## FHE Operations Used

### Access Control
- `FHE.allow(encryptedValue, user)` - Grant decryption access
- `FHE.allowTransient(encryptedValue, user)` - Temporary access

### Comparison
- `FHE.eq(a, b)` - Equality check
- `FHE.gte(a, b)` - Greater than or equal
- `FHE.lt(a, b)` - Less than

### Arithmetic
- `FHE.add(a, b)` - Addition
- `FHE.sub(a, b)` - Subtraction
- `FHE.mul(a, b)` - Multiplication

## Module Dependencies

### Core Dependencies
```
@fhevm/solidity         - FHE Solidity library
hardhat                 - Smart contract framework
ethers.js               - Blockchain interaction
```

### Development Dependencies
```
@nomicfoundation/hardhat-toolbox
solidity-coverage       - Code coverage
hardhat-gas-reporter    - Gas usage reporting
ESLint + Prettier       - Code linting
```

## Network Support

### Supported Networks

| Network | Chain ID | Type | FHE Support |
|---------|----------|------|------------|
| Hardhat | 31337 | Local | ✅ Yes |
| Sepolia | 11155111 | Testnet | ⚠️ Limited |
| Zama Network | 9000 | Testnet | ✅ Full |

## Security Considerations

### Encrypted Data Protection
- All sensitive data encrypted at rest
- Decryption keys stored locally (not on contract)
- Access controlled via `FHE.allow()`

### Input Validation
- Input proofs verified for all encrypted inputs
- User authentication checked
- Rate limiting implemented

### Access Control
- Three role-based access levels (Client, Lawyer, Admin)
- Role verification on sensitive operations
- Transient access for temporary permissions

## Scalability Considerations

### Gas Optimization
- Minimal storage operations
- Efficient state transitions
- Batch operations supported

### Future Improvements
- Off-chain encryption for large documents
- IPFS integration for document storage
- Multi-signature approvals
- Advanced permission hierarchies

## Development Workflow

```
1. Write Solidity Contract
   ↓
2. Write Comprehensive Tests
   ↓
3. Run Local Tests (Hardhat)
   ↓
4. Deploy to Sepolia/Zama
   ↓
5. Verify on Etherscan
   ↓
6. Interact via CLI Scripts
   ↓
7. Document in GitBook
```

## Maintenance

### Dependency Updates
When updating `@fhevm/solidity`:
1. Update in `package.json`
2. Run `npm install`
3. Run full test suite
4. Update documentation if API changed

### Code Quality
- Solidity linting: `solhint`
- JavaScript linting: `eslint`
- Code formatting: `prettier`
- Security audit: `npm audit`

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://soliditylang.org/)
