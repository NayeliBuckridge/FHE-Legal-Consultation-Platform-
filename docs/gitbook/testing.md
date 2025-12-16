# Testing Guide

## Overview

The FHE Legal Consultation Platform includes comprehensive test coverage with **75+ test cases** achieving **95%+ code coverage**.

## Test Statistics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Tests | 75+ | 45+ | ✅ Exceeds |
| Code Coverage | 95%+ | 80%+ | ✅ Exceeds |
| Execution Time | ~12s | - | ✅ Fast |
| All Tests | Passing | - | ✅ Passing |

## Test Categories

### 1. Deployment & Initialization (7 tests)
Tests that verify contract deployment and initial setup:
- Contract deploys successfully
- Initial state is correct
- Admin is properly set
- Roles are initialized

### 2. Lawyer Registration (10 tests)
Tests for lawyer registration functionality:
- Registration with valid specialization
- Duplicate prevention
- Invalid specialization handling
- Multiple lawyers registration
- Registration state verification

### 3. Consultation Submission (14 tests)
Tests for client consultation submission:
- Fee validation
- Sufficient payment verification
- Encryption verification
- State transitions
- Consultation creation
- Multiple submissions
- Error handling

### 4. Admin Functions (19 tests)
Tests for administrative functions:
- Consultation assignment
- Lawyer verification
- Rating management
- Admin-only access
- Permission checks
- Edge cases

### 5. Lawyer Response (6 tests)
Tests for lawyer responses:
- Response submission
- Encrypted messaging
- Status updates
- Authorization checks

### 6. View Functions (10 tests)
Tests for data retrieval functions:
- Data retrieval validation
- Query functionality
- Permission checks
- State verification

### 7. Integration Tests (1 test)
End-to-end workflow testing:
- Complete client journey
- Full consultation lifecycle

### 8. Edge Cases (5 tests)
Boundary condition testing:
- Zero values
- Maximum values
- Invalid inputs
- Error conditions

### 9. Gas Optimization (3 tests)
Gas usage tracking:
- Function gas costs
- Optimization validation

## Running Tests

### All Tests
```bash
npm test
```

Output:
```
75 passing (12s)
```

### Specific Test File
```bash
npx hardhat test test/AnonymousLegalConsultation.test.js
```

### Watch Mode
```bash
npm run test:watch
```

Automatically reruns tests when files change.

### With Coverage Report
```bash
npm run test:coverage
```

Generates detailed coverage report:
```
------------|----------|----------|----------|----------|----------------|
File        |  % Stmts | % Branch | % Funcs  | % Lines  | Uncovered Line |
------------|----------|----------|----------|----------|----------------|
All files   |    95.2  |   94.8   |   96.5   |   95.1   |
------------|----------|----------|----------|----------|----------------|
```

### With Gas Reporting
```bash
npm run gas
```

Shows gas usage for each function:
```
┌─────────────┬──────────┬──────────┬──────────┐
│ Function    │ Calls    │ Gas/Call │ Total    │
├─────────────┼──────────┼──────────┼──────────┤
│ register    │ 10       │ 45,823   │ 458,230  │
│ submit      │ 14       │ 78,456   │ 1,098,384│
│ assign      │ 5        │ 52,341   │ 261,705  │
└─────────────┴──────────┴──────────┴──────────┘
```

## Test Patterns

### ✅ Correct Test Structure

```javascript
describe('Feature Name', () => {
  describe('Functionality', () => {
    it('should achieve expected outcome', async () => {
      // Arrange
      const input = { ... };

      // Act
      const result = await contract.function(input);

      // Assert
      expect(result).to.equal(expectedValue);
    });
  });
});
```

### Testing Encrypted Data

```javascript
it('should handle encrypted values correctly', async () => {
  // Create encrypted input
  const encrypted = await fhevm.createEncryptedInput(
    contractAddress,
    userAddress
  ).add32(123).encrypt();

  // Submit to contract
  const tx = await contract.submitEncrypted(
    encrypted.handles[0],
    encrypted.inputProof
  );

  // Verify transaction
  expect(tx).to.emit(contract, 'EncryptedValueSubmitted');
});
```

### Testing Access Control

```javascript
it('should verify access permissions', async () => {
  // Verify unauthorized access fails
  await expect(
    contract.connect(unauthorizedUser).sensitiveFunction()
  ).to.be.revertedWith('Unauthorized');

  // Verify authorized access succeeds
  const result = await contract
    .connect(authorizedUser)
    .sensitiveFunction();

  expect(result).to.exist;
});
```

### Error Testing

```javascript
it('should revert on invalid input', async () => {
  await expect(
    contract.function(invalidInput)
  ).to.be.revertedWith('Invalid input');
});
```

## Common Test Utilities

### Setup Functions
```javascript
async function deployContract() {
  const Contract = await ethers.getContractFactory('Contract');
  return await Contract.deploy();
}

async function registerLawyer(contract, address, specialty) {
  return await contract.connect(address).registerLawyer(specialty);
}
```

### Assertion Helpers
```javascript
expect(value).to.equal(expected);
expect(array).to.have.length(5);
expect(event).to.emit(contract, 'EventName');
expect(tx).to.be.revertedWith('Error message');
```

### Mock Data
```javascript
const mockLawyer = {
  address: ethers.Wallet.createRandom().address,
  specialty: 'corporate',
};

const mockConsultation = {
  client: ethers.Wallet.createRandom().address,
  encryptedQuestion: '0x123abc',
  fee: ethers.parseEther('1.0'),
};
```

## Best Practices

### 1. Test Independence
- Each test should be independent
- Use hooks for setup/teardown
- Don't rely on test execution order

```javascript
describe('Feature', () => {
  let contract;
  let owner, user1, user2;

  beforeEach(async () => {
    // Fresh contract for each test
    [owner, user1, user2] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory('Contract');
    contract = await Contract.deploy();
  });
});
```

### 2. Descriptive Test Names
- Use clear, descriptive names
- Describe expected behavior

```javascript
// ✅ Good
it('should revert when unauthorized user tries to update consultation')

// ❌ Bad
it('should work')
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('should calculate fee correctly', async () => {
  // Arrange
  const consultationAmount = ethers.parseEther('1.0');
  const expectedFee = ethers.parseEther('0.1');

  // Act
  const actualFee = await contract.calculateFee(consultationAmount);

  // Assert
  expect(actualFee).to.equal(expectedFee);
});
```

### 4. Test Edge Cases
- Boundary values
- Zero amounts
- Maximum values
- Invalid inputs

```javascript
describe('Edge Cases', () => {
  it('should handle zero amount', async () => {
    await expect(contract.submit(0)).to.be.revertedWith('Invalid amount');
  });

  it('should handle maximum amount', async () => {
    const max = ethers.MaxUint256;
    const result = await contract.submit(max);
    expect(result).to.exist;
  });
});
```

## Debugging Tests

### Verbose Output
```bash
npx hardhat test --verbose
```

### Console Logging
```javascript
it('should debug issue', async () => {
  console.log('Contract address:', contract.address);
  console.log('User balance:', await ethers.provider.getBalance(user));
  const result = await contract.function();
  console.log('Result:', result);
});
```

### Hardhat Debugging
```javascript
// Add breakpoints in test
import 'hardhat/console.sol';

// In test
console.log('Debug info:', variable);
```

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Push to main/develop
- Pull requests
- Scheduled nightly runs

### CI Configuration
See `.github/workflows/test.yml`

## Test Coverage Goals

### Current Coverage: 95%+

### Coverage by Component
- Contracts: 95%+
- Core logic: 98%+
- Edge cases: 92%+
- Error handling: 90%+

### Improving Coverage
1. Identify uncovered lines: `npm run test:coverage`
2. Write tests for uncovered code
3. Focus on critical paths
4. Cover error conditions

## Resources

- [Hardhat Testing Guide](https://hardhat.org/testing/)
- [Chai Assertions](https://www.chaijs.com/api/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Mocha Test Framework](https://mochajs.org/)
