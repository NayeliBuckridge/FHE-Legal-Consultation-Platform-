# Quick Start Guide

Get up and running with the FHE Legal Consultation Platform in minutes. This guide covers installation, testing, deployment, and interaction with the smart contract.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or 20.x (recommended)
- **npm** or **yarn**: Latest version
- **Git**: For cloning the repository
- **MetaMask**: Wallet for testnet transactions

### Optional Tools
- **VS Code**: Recommended IDE with Solidity extension
- **Terminal**: Command line interface

## Step 1: Installation

### Clone the Repository
```bash
# Clone the project
git clone https://github.com/CarrieMorar/FHELegalConsultation.git
cd FHELegalConsultation

# Verify the directory structure
ls
# Should see: contracts/, test/, scripts/, docs/, hardhat.config.js, package.json
```

### Install Dependencies
```bash
# Install npm dependencies
npm install

# Verify installation
npm list --depth=0
# Should show: ethers, hardhat, @nomicfoundation/hardhat-toolbox, etc.
```

### Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit the file with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables**:
```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_RPC_URL=https://devnet.zama.ai

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_optional

# Gas Reporting
REPORT_GAS=true
```

### Get Test ETH
Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH for deployment:
1. Connect your wallet
2. Enter your address
3. Request test ETH
4. Wait for confirmation

## Step 2: Testing

### Compile Contracts
```bash
# Compile all contracts
npm run compile

# Output should show:
# Compiled 1 Solidity file successfully
# artifacts/ directory created with contract artifacts
```

### Run Test Suite
```bash
# Run all tests
npm test

# Expected output:
# AnonymousLegalConsultation
#   Deployment and Initialization
#     ✓ Should deploy successfully
#     ✓ Should set correct admin
#     ...
#   75 passing (12s)
```

### Test with Coverage
```bash
# Generate coverage report
npm run test:coverage

# View the report
open coverage/index.html  # on macOS
# or
start coverage/index.html  # on Windows

# Should show:
# -------------------|----------|----------|----------|----------|
# File               |  % Stmts | % Branch |  % Funcs |  % Lines |
# -------------------|----------|----------|----------|----------|
# contracts/...      |      100 |    95.45 |      100 |      100 |
# -------------------|----------|----------|----------|----------|
# All files          |      95 |    89.12 |      98 |      95 |
# -------------------|----------|----------|----------|----------|
```

### Run Gas Analysis
```bash
# Generate gas report
npm run gas

# Output shows gas costs:
# AnonymousLegalConsultation
#   registerLawyer  -  150,289 gas
#   submitConsultation -  201,284 gas
#   provideResponse -  100,673 gas
```

## Step 3: Local Development

### Start Local Node
```bash
# Start a local Hardhat node
npm run node

# Output:
# Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
# Accounts: [20 accounts listed with their private keys]
# Keep this running in a separate terminal
```

### Deploy Locally
```bash
# In a new terminal, deploy to local network
npm run deploy:localhost

# Expected output:
# ========================================
# 🚀 Deploying AnonymousLegalConsultation
# ========================================
# Network: localhost (chainId: 31337)
# Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# Balance: 10000 ETH
#
# ✅ Contract deployed!
# Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Transaction: 0x...
#
# 📝 Deployment saved to: deployments/localhost/
```

### Verify Local Deployment
```bash
# Check contract is working
npm run interact:localhost

# Follow the CLI menu:
# ┌─────────────────────────────────────────┐
# │   Anonymous Legal Consultation CLI      │
# ├─────────────────────────────────────────┤
# │  1. Client Actions                      │
# │  2. Lawyer Actions                      │
# │  3. Admin Actions                       │
# │  4. View Statistics                     │
# │  5. Exit                                │
# └─────────────────────────────────────────┘
#
# Select option: 1
# [Follow prompts for client actions]
```

### Run Complete Simulation
```bash
# Run workflow simulation
npm run simulate:localhost

# Output shows:
# ===============================
# 🔄 Workflow Simulation
# ===============================
#
# Phase 1: Register Lawyers
# ✓ Registered 3 lawyers
#
# Phase 2: Verify Lawyers
# ✓ Verified 3 lawyers
#
# Phase 3: Submit Consultations
# ✓ Submitted 5 consultations
#
# Phase 4: Assign Consultations
# ✓ Assigned all consultations
#
# Phase 5: Provide Responses
# ✓ Lawyers provided responses
#
# Phase 6: Display Statistics
# Total Lawyers: 3
# Total Consultations: 5
# Completed: 5
# Pending: 0
```

## Step 4: Testnet Deployment

### Deploy to Sepolia
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Expected output:
# ========================================
# 🚀 Deploying AnonymousLegalConsultation
# ========================================
# Network: Sepolia (chainId: 11155111)
# Deployer: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4
# Balance: 0.5 ETH
#
# ✅ Contract deployed!
# Address: 0xBA9Daca2dEE126861963cd31752A9aCBc5488Df7
# Transaction: 0xabcd...ef01
#
# 📝 Deployment saved to: deployments/sepolia/
#
# 🔍 Verify on Etherscan:
# https://sepolia.etherscan.io/address/0xBA9D...8Df7
```

### Verify on Etherscan
```bash
# Verify contract on Etherscan
npm run verify:sepolia

# Output:
# ✅ Contract verified!
# https://sepolia.etherscan.io/address/0xBA9D...8Df7#code
```

### Interact with Deployed Contract
```bash
# Interact with Sepolia deployment
npm run interact:sepolia

# Follow the menu to:
# 1. Register as a lawyer
# 2. Submit a consultation
# 3. Assign consultations (admin)
# 4. Provide responses (lawyer)
# 5. View statistics
```

## Step 5: Exploring the Code

### Smart Contract
```bash
# View the main contract
cat contracts/AnonymousLegalConsultation.sol

# Key sections to understand:
# - Data structures (lines 12-38)
# - Access control (lines 56-69)
# - Client functions (lines 87-115)
# - Lawyer functions (lines 117-140)
# - Admin functions (lines 142-200)
```

### Test Suite
```bash
# View the comprehensive tests
cat test/AnonymousLegalConsultation.test.js

# Test categories:
# - Deployment tests (7 tests)
# - Lawyer registration (10 tests)
# - Consultation submission (14 tests)
# - Admin functions (19 tests)
# - Lawyer response (6 tests)
# - View functions (10 tests)
# - Integration tests (1 test)
# - Edge cases (5 tests)
```

### Automation Scripts
```bash
# View deployment script
cat scripts/deploy.js

# Key features:
# - Balance validation
# - Multi-network support
# - Deployment tracking
# - Error handling

# View interaction script
cat scripts/interact.js

# Features:
# - Interactive CLI menu
# - All contract functions
# - Error handling
# - User-friendly prompts
```

## Step 6: Customization

### Modify the Contract
```bash
# Open contract in your editor
code contracts/AnonymousLegalConsultation.sol

# Common customizations:
# 1. Add new legal categories
# 2. Modify consultation fees
# 3. Add new encrypted fields
# 4. Implement additional functions
```

### Add New Tests
```bash
# Open test file
code test/AnonymousLegalConsultation.test.js

# Add tests following pattern:
describe("New Feature", function () {
  it("Should implement new functionality", async function () {
    // Test implementation
  });
});
```

### Update Documentation
```bash
# Edit documentation
nano README.md

# Key sections to update:
# - Features section
# - Architecture section
# - Usage examples
# - API documentation
```

## Step 7: Production Considerations

### Security Audit
```bash
# Run security checks
npm run security

# Output should show:
# found 0 vulnerabilities
# npm audit passed
```

### Code Quality
```bash
# Check formatting
npm run format:check

# Lint JavaScript
npm run lint

# Lint Solidity
npm run lint:solidity
```

### Contract Size
```bash
# Check contract size
npm run size

# Should show:
# Contract: AnonymousLegalConsultation
# Deployment Cost: 2,567,432 gas
# Creation Cost: 2,245,678 gas
```

## Troubleshooting

### Common Issues

#### Installation Problems
```bash
# If npm install fails:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If permissions error (macOS/Linux):
sudo chown -R $(whoami) node_modules
```

#### Compilation Errors
```bash
# Check Solidity version in hardhat.config.js
# Should be: "version": "0.8.24"

# Clear cache
npm run clean
npm run compile
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test
npm test -- --grep "specific test name"
```

#### Deployment Failures
```bash
# Check wallet balance
npx hardhat console --network sepolia
> const balance = await ethers.provider.getBalance("YOUR_ADDRESS");
> console.log(ethers.formatEther(balance));

# Check RPC URL
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SEPOLIA_RPC_URL
```

### Getting Help

1. **Check the logs**: Enable verbose output with `--verbose`
2. **Review documentation**: Check [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed steps
3. **Search issues**: Check [GitHub Issues](https://github.com/CarrieMorar/FHELegalConsultation/issues)
4. **Join community**: Visit [Zama Discord](https://discord.gg/zama)

## Next Steps

### For Learning
1. **Study the code**: Read through contracts and tests
2. **Run simulations**: Try different scenarios
3. **Modify examples**: Make changes and test
4. **Review documentation**: Read all guide files

### For Development
1. **Fork the repository**: Create your own version
2. **Implement features**: Add new functionality
3. **Write tests**: Ensure comprehensive coverage
4. **Deploy to testnet**: Test on Sepolia

### For Bounty Track
1. **Review requirements**: Check [BOUNTY_TRACK_ALIGNMENT.md](../BOUNTY_TRACK_ALIGNMENT.md)
2. **Create examples**: Adapt for different categories
3. **Record demo**: Create video demonstration
4. **Submit**: Follow submission guidelines

## Resources

### Documentation
- [Complete README](../README.md) - Full project documentation
- [Testing Guide](../TESTING.md) - Testing strategies and best practices
- [Deployment Guide](../DEPLOYMENT.md) - Detailed deployment instructions
- [Security Guide](../SECURITY_PERFORMANCE.md) - Security considerations

### External Resources
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm) - Official FHEVM documentation
- [Hardhat Documentation](https://hardhat.org/) - Hardhat development framework
- [Ethers.js Docs](https://docs.ethers.org/) - Ethereum library

### Tools and Utilities
- [Hardhat Console](https://hardhat.org/docs/guides/using-hardhat-console.html) - Interactive contract testing
- [Sepolia Etherscan](https://sepolia.etherscan.io/) - Block explorer for testnet
- [Faucet Links](https://docs.zama.ai/fhevm/faucets) - Test ETH faucets

---

## 🎉 Congratulations!

You've successfully:
- ✅ Set up a complete FHEVM development environment
- ✅ Compiled and tested a privacy-preserving smart contract
- ✅ Deployed to local and testnet environments
- ✅ Interacted with encrypted data on-chain
- ✅ Learned FHEVM patterns and best practices

You're now ready to build your own privacy-preserving applications with FHEVM!

---

*Need help? Check our [Troubleshooting Guide](troubleshooting.md) or join our community on Discord!* 🚀