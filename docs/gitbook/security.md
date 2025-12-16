# Security Best Practices

## Overview

This document outlines security considerations and best practices for using the FHE Legal Consultation Platform.

## Privacy Model

### What's Encrypted

✅ **Protected Data**:
- Client identities
- Client questions/consultations
- Lawyer specialties
- Lawyer responses
- Ratings and feedback
- All sensitive information

### What's Public

⚠️ **Visible Data**:
- Transaction metadata
- Wallet addresses (anonymized)
- Consultation counts (if not sensitive)
- Service fees
- Status information

## Cryptographic Security

### Fully Homomorphic Encryption (FHE)

**Benefits**:
- Computation on encrypted data without decryption
- No decryption keys exposed to contract
- Privacy-preserving operations

**Implementation**:
```solidity
// Contract never sees decrypted values
euint32 secret = FHE.fromExternal(encryptedInput, inputProof);
euint32 result = FHE.add(secret, otherSecret);
// Result remains encrypted
```

### Input Proofs

All encrypted inputs require zero-knowledge proofs:

```solidity
function submitQuestion(
  bytes calldata encryptedQuestion,
  bytes calldata inputProof  // Proof of correct encryption
) external {
  euint32 decrypted = FHE.fromExternal(encryptedQuestion, inputProof);
  // Proof ensures encryption was done correctly
}
```

**Importance**:
- Prevents invalid encrypted inputs
- Verifies sender identity
- Ensures data integrity

## Access Control

### Role-Based Access Control

```solidity
enum Role {
  CLIENT,    // Can submit consultations
  LAWYER,    // Can respond to consultations
  ADMIN      // Can manage the platform
}

mapping(address => Role) private userRoles;
```

### Permission Functions

#### FHE.allow()
Grant permanent decryption access:
```solidity
// Client can decrypt their consultation
FHE.allow(encryptedConsultation, client);

// Lawyer can decrypt assigned consultation
FHE.allow(encryptedResponse, lawyer);
```

#### FHE.allowTransient()
Grant temporary decryption access:
```solidity
// Allow decryption only for this transaction
FHE.allowTransient(encryptedData, temporaryUser);
```

#### FHE.allowThis()
Allow contract to use encrypted value:
```solidity
// Contract can use encrypted value internally
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, user);
```

### Critical Pattern

```solidity
// ✅ CORRECT: Grant both permissions
FHE.allowThis(encryptedValue);      // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission

// ❌ WRONG: Missing allowThis
FHE.allow(encryptedValue, msg.sender); // Will fail!
```

## Input Validation

### Client Input Validation

```solidity
function submitConsultation(
  bytes calldata encryptedQuestion,
  bytes calldata inputProof,
  string calldata legalCategory
) external payable {
  // ✅ Validate inputs
  require(msg.value >= CONSULTATION_FEE, "Insufficient fee");
  require(bytes(legalCategory).length > 0, "Invalid category");
  require(encryptedQuestion.length > 0, "Invalid input");

  // Process encrypted data...
}
```

### Approved Categories

```solidity
bytes32[] private APPROVED_CATEGORIES = [
  "corporate",
  "immigration",
  "family",
  "criminal",
  "intellectual-property",
  "real-estate",
  "contract",
  "employment"
];

function validateCategory(string memory category) internal view {
  require(isApprovedCategory(category), "Invalid category");
}
```

## Reentrancy Protection

### State Transition Pattern

```solidity
// ✅ SAFE: Update state before external calls
enum Status { PENDING, ASSIGNED, RESPONDED, COMPLETED }

function completeConsultation(uint256 consultationId) external {
  Consultation storage consultation = consultations[consultationId];

  // Update state first
  consultation.status = Status.COMPLETED;

  // Then perform external operations
  payable(lawyer).transfer(consultationFee);
}
```

### Checks-Effects-Interactions Pattern

```solidity
function respondToConsultation(
  uint256 consultationId,
  bytes calldata encryptedResponse,
  bytes calldata inputProof
) external {
  // 1. CHECKS: Verify preconditions
  require(isLawyer(msg.sender), "Not a lawyer");
  require(isAssignedToConsultation(msg.sender, consultationId), "Not assigned");

  // 2. EFFECTS: Update contract state
  consultations[consultationId].response = encryptedResponse;
  consultations[consultationId].respondent = msg.sender;

  // 3. INTERACTIONS: Perform external calls
  emit ResponseSubmitted(consultationId, msg.sender);
}
```

## Rate Limiting & DoS Prevention

### Submission Rate Limiting

```solidity
mapping(address => uint256) private lastSubmissionTime;
uint256 constant SUBMISSION_COOLDOWN = 5 minutes;

function submitConsultation(...) external payable {
  require(
    block.timestamp >= lastSubmissionTime[msg.sender] + SUBMISSION_COOLDOWN,
    "Please wait before submitting again"
  );

  lastSubmissionTime[msg.sender] = block.timestamp;
  // ... rest of function
}
```

### Gas-Efficient Operations

- Avoid nested loops
- Batch operations
- Use events instead of storage
- Optimize state variables

## Emergency Procedures

### Pause Mechanism

```solidity
bool private paused = false;

modifier whenNotPaused() {
  require(!paused, "Contract is paused");
  _;
}

function pause() external onlyAdmin {
  paused = true;
  emit ContractPaused();
}

function unpause() external onlyAdmin {
  paused = false;
  emit ContractUnpaused();
}
```

### Emergency Withdrawal

```solidity
function emergencyWithdraw() external onlyAdmin {
  uint256 balance = address(this).balance;
  require(balance > 0, "No funds to withdraw");

  payable(admin).transfer(balance);
  emit EmergencyWithdraw(balance);
}
```

## Data Privacy Practices

### Avoid Exposing Sensitive Data

```javascript
// ❌ WRONG: Logging sensitive data
console.log('User question:', encryptedData); // Don't log!

// ✅ CORRECT: Log only non-sensitive info
console.log('Consultation submitted by:', client);
console.log('Category:', category);
```

### Local Key Management

```javascript
// ✅ Keep private keys secure
const privateKey = process.env.PRIVATE_KEY; // From .env only
const wallet = new ethers.Wallet(privateKey);

// ✅ Don't log or expose keys
// console.log(privateKey); // NEVER!
```

## Audit Recommendations

Before production deployment:

- [ ] Smart contract audit by security firm
- [ ] Penetration testing
- [ ] Code review
- [ ] Vulnerability assessment
- [ ] Load testing

### Tools Used

```bash
# Static analysis
npm audit
solhint contracts/**/*.sol

# Coverage analysis
npm run test:coverage

# Gas analysis
npm run gas
```

## Incident Response

### If a Vulnerability is Discovered

1. **Assess Severity**
   - Critical: Pause contract immediately
   - High: Plan emergency patch
   - Medium/Low: Schedule regular update

2. **Notify Stakeholders**
   - Inform users of issue
   - Provide workaround if available
   - Set timeline for fix

3. **Deploy Fix**
   - Test extensively
   - Deploy to testnet first
   - Verify on testnet
   - Deploy to mainnet

4. **Post-Incident**
   - Publish incident report
   - Update security practices
   - Conduct audit
   - Monitor for similar issues

## Compliance Considerations

### Data Protection

- GDPR: Encryption provides privacy
- CCPA: User control over data
- HIPAA: Confidential information protection
- SOC 2: Security controls in place

### Legal Considerations

- Smart contract limitations
- Regulatory compliance
- Liability disclaimers
- Terms of service

## Security Checklist

**Before Each Deployment**:
- [ ] All tests passing
- [ ] No security warnings
- [ ] Code reviewed
- [ ] Dependencies updated
- [ ] Private keys secured
- [ ] Environment variables set
- [ ] Testnet deployment verified
- [ ] Emergency procedures ready

**Production Checklist**:
- [ ] Security audit completed
- [ ] Insurance/coverage in place
- [ ] Monitoring setup
- [ ] Response procedures ready
- [ ] Backup systems operational
- [ ] User documentation updated

## Resources

- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [Ethereum Security Best Practices](https://ethereum.org/en/developers/docs/smart-contracts/security/)
- [FHEVM Security Guidelines](https://docs.zama.ai/fhevm/security)

## Contact & Reporting

For security concerns:
- Email: security@platform.example.com
- GitHub Security Advisory
- Responsible Disclosure: See SECURITY.md
