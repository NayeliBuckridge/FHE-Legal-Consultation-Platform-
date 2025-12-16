# Contributing Guide

## Welcome!

We welcome contributions to the FHE Legal Consultation Platform. This guide will help you get started.

## Code of Conduct

Please be respectful and professional:
- Be inclusive
- Respect diverse viewpoints
- Keep discussions focused
- Report violations to maintainers

## Getting Started

### 1. Fork the Repository
```bash
# On GitHub, click "Fork"
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/FHELegalConsultation.git
cd FHELegalConsultation
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# Or for bug fixes:
git checkout -b fix/issue-description
```

### 3. Set Up Development Environment
```bash
npm install
npm run compile
npm test
```

## Development Workflow

### Making Changes

1. **Identify the Issue**
   - Check existing issues
   - Create new issue if needed
   - Discuss large changes first

2. **Write Code**
   - Follow project style
   - Include comments for complex logic
   - Keep changes focused

3. **Test Thoroughly**
   ```bash
   npm test
   npm run test:coverage
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

### Commit Messages

Follow conventional commits:

```
type(scope): description

feat(contracts): add new encryption pattern
fix(tests): correct validation test
docs(guide): update deployment instructions
style(code): format code with prettier
refactor(utils): simplify helper functions
test(unit): add test for edge case
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code formatting
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Maintenance tasks

## Contributing Patterns

### Adding a New Example

1. **Create Contract** (`examples/contracts/`)
   ```solidity
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.24;

   /// @title Descriptive Title
   /// @notice Clear description of what this does
   /// @dev Implementation details
   contract ExampleContract {
     // Implementation
   }
   ```

2. **Create Test** (`examples/test/`)
   ```javascript
   describe('ExampleContract', () => {
     let contract;

     beforeEach(async () => {
       const Contract = await ethers.getContractFactory('ExampleContract');
       contract = await Contract.deploy();
     });

     it('should do something', async () => {
       // Arrange, Act, Assert
     });
   });
   ```

3. **Update Scripts**
   - Add to `create-fhevm-example.ts`
   - Add to `generate-docs.ts`

4. **Document**
   - Run `npm run generate:docs example-name`
   - Update SUMMARY.md

### Adding Documentation

1. Create markdown file in `docs/gitbook/`
2. Update `SUMMARY.md`
3. Include code examples
4. Add links to related docs

### Improving Tests

1. Increase coverage
2. Add edge cases
3. Test error conditions
4. Document test purpose

## Code Standards

### Solidity Style

Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html):

```solidity
// ✅ Good
contract MyContract {
  uint256 public constant MAXIMUM_VALUE = 100;

  function publicFunction() public view returns (uint256) {
    return MAXIMUM_VALUE;
  }

  function _internalFunction() internal pure returns (bool) {
    return true;
  }
}

// ❌ Bad
contract MyContract {
  uint256 public MAXIMUM_VALUE = 100;
  function publicFunction() returns (uint256) {
    return MAXIMUM_VALUE;
  }
}
```

### JavaScript/TypeScript Style

Follow project ESLint configuration:

```javascript
// ✅ Good
async function deployContract() {
  const Contract = await ethers.getContractFactory('ContractName');
  const contract = await Contract.deploy();
  return contract;
}

// ❌ Bad
async function deployContract() {
  const C = await ethers.getContractFactory('ContractName');
  const c = await C.deploy();
  return c;
}
```

### Comments and Documentation

Use JSDoc/TSDoc format:

```javascript
/**
 * Submits a consultation to the platform
 *
 * @param {string} question - The encrypted question
 * @param {string} category - Legal category
 * @returns {Promise<TransactionResponse>} Transaction receipt
 *
 * @example
 * const tx = await submitConsultation(encrypted, 'corporate');
 * await tx.wait();
 */
async function submitConsultation(question, category) {
  // Implementation
}
```

## Testing Requirements

### Test Coverage

- Minimum 90% code coverage
- All new features must have tests
- Include success and failure cases

```bash
npm run test:coverage
```

### Test Quality

- Clear, descriptive names
- Arrange-Act-Assert pattern
- Independent tests
- Edge case coverage

## Linting and Formatting

### Run All Checks

```bash
npm run lint:solidity     # Solidity linting
npm run lint              # JavaScript linting
npm run prettier:check    # Code format check
npm run format            # Auto-format code
```

### Pre-Commit Hook

Automatic checks before commit:
```bash
npm run prepare  # Install husky hooks
```

## Pull Request Process

### 1. Push Your Branch
```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request
- Clear title describing changes
- Detailed description of what and why
- Reference related issues (#123)
- Include screenshots for UI changes

### 3. PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Related Issues
Closes #123

## Testing
- [ ] Tests pass locally
- [ ] Coverage maintained
- [ ] No new warnings

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### 4. Review Process

- Maintainers will review code
- Request changes if needed
- Approve when ready
- Merge when CI passes

## Documentation Requirements

### For New Features

1. **Code Comments**
   - Explain complex logic
   - Document parameters
   - Note limitations

2. **GitBook Documentation**
   - Add example section
   - Include code snippets
   - Explain use cases

3. **README Updates**
   - List new features
   - Update table of contents
   - Link to documentation

### For Bug Fixes

1. **Issue Description**
   - Steps to reproduce
   - Expected vs actual
   - Environment details

2. **Fix Explanation**
   - Root cause
   - Solution approach
   - Testing verification

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.0.0` - Major release
- `1.1.0` - Minor feature
- `1.0.1` - Bug fix

### Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run all tests
- [ ] Run security audit
- [ ] Tag release on GitHub
- [ ] Create release notes
- [ ] Announce update

## Getting Help

### Questions

- GitHub Discussions
- Email: contributing@example.com
- Discord community

### Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Project README](../README.md)
- [Architecture Guide](architecture.md)

## Contributor Recognition

### Hall of Fame

Contributors are recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes for major contributions

### Compensation

- Bug bounties for security issues
- Potential grants for major features
- Rewards for documentation

## Areas for Contribution

### High Priority

- [ ] Security improvements
- [ ] Performance optimization
- [ ] Documentation expansion
- [ ] Test coverage increase
- [ ] New example contracts

### Medium Priority

- [ ] UI improvements
- [ ] Error message clarity
- [ ] Developer experience
- [ ] Code refactoring

### Low Priority

- [ ] Code style consistency
- [ ] Comment improvements
- [ ] Documentation formatting
- [ ] Example additions

## Reporting Issues

### Security Issues

**IMPORTANT**: Do NOT create public GitHub issues for security vulnerabilities.

Instead, email: security@example.com with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Bug Reports

Include:
- Title: Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)
- Code sample if possible

### Feature Requests

Include:
- Clear use case
- Benefits to project
- Example implementation (if any)
- Potential challenges

## Review Feedback

### Common Feedback Types

**Suggestion**: Proposed improvement
```
💡 Consider using destructuring here:
const { value } = obj;
```

**Question**: Clarification needed
```
❓ Why use this approach instead of X?
```

**Required**: Must be fixed
```
⚠️ This breaks backward compatibility
```

**Praise**: Good work!
```
✨ Great test coverage for this feature!
```

## Learning Resources

### Smart Contracts
- [Solidity by Example](https://solidity-by-example.org/)
- [Ethereum Development](https://ethereum.org/en/developers/)

### FHEVM
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://github.com/zama-ai/fhevm-examples)

### Testing
- [Hardhat Testing](https://hardhat.org/testing/)
- [Chai Assertions](https://www.chaijs.com/)

## Thank You!

Thank you for considering contributing to the FHE Legal Consultation Platform. Your efforts help improve privacy-preserving smart contracts for everyone!

---

**Questions?** Feel free to reach out to the community!
