# Deployment Guide

## Overview

This guide covers deploying the FHE Legal Consultation Platform to different networks.

## Supported Networks

| Network | Chain ID | Status | Method |
|---------|----------|--------|--------|
| Hardhat (Local) | 31337 | ✅ | Hardhat Node |
| Sepolia (Testnet) | 11155111 | ✅ | RPC |
| Zama Network | 9000 | ✅ | RPC |

## Prerequisites

### Required
- Node.js 18.x or 20.x
- npm or yarn
- Git
- MetaMask wallet (for testnet)

### Environment Setup

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Private Keys
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ZAMA_RPC_URL=https://zama-testnet-rpc.url

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key_here
```

## Local Deployment (Hardhat)

### 1. Start Local Node
```bash
npm run node
```

This starts a local Hardhat node at `http://127.0.0.1:8545`

### 2. Deploy Contract
In a new terminal:
```bash
npm run deploy:localhost
```

Output:
```
🚀 Deploying to network: hardhat

✅ AnonymousLegalConsultation deployed to: 0xBA9Daca2dEE126861963cd31752A9aCBc5488Df7
```

### 3. Interact with Contract
```bash
npm run interact:localhost
```

This opens an interactive menu for:
- Registering lawyers
- Submitting consultations
- Assigning cases
- Viewing data

## Sepolia Testnet Deployment

### 1. Get Testnet ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) and request ETH.

### 2. Deploy Contract
```bash
npm run deploy:sepolia
```

Output includes contract address:
```
✅ AnonymousLegalConsultation deployed to: 0x...
```

### 3. Verify on Etherscan
```bash
npm run verify:sepolia
```

Contract is now verified and visible on:
https://sepolia.etherscan.io/address/0x...

### 4. Monitor Deployment

Check transaction on Sepolia:
```bash
# View in browser
https://sepolia.etherscan.io/tx/0x...

# Or use ethers to check
npx hardhat run scripts/check-deployment.js --network sepolia
```

## Zama Network Deployment

### 1. Get Zama Testnet Access

Contact Zama team or register at: https://zama.ai/

### 2. Deploy Contract
```bash
npm run deploy:zama
```

### 3. Verify Deployment
```bash
# Check contract on Zama explorer
https://zama-explorer.url/address/0x...
```

## Deployment Process

### Automated Deployment Script

The deployment script (`scripts/deploy.js`) automatically:

1. ✅ Gets deployer account from private key
2. ✅ Compiles contracts
3. ✅ Deploys main contract
4. ✅ Deploys example contracts
5. ✅ Outputs deployment addresses
6. ✅ Saves deployment info

### Manual Deployment

For custom deployment:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Post-Deployment

### 1. Verify Contract Code
```bash
npm run verify:sepolia
```

### 2. Register Initial Lawyer
```bash
npm run interact:sepolia
# Select: Register Lawyer
# Enter specialization
```

### 3. Submit Test Consultation
```bash
npm run interact:sepolia
# Select: Submit Consultation
# Enter encrypted question
# Specify lawyer category
```

### 4. Monitor Contract Activity
```bash
# View on Etherscan
https://sepolia.etherscan.io/address/0x...

# Check gas usage
npm run gas
```

## Upgrade Strategy

### Smart Contract Upgrades

For contract changes:

1. **Update Contract Code**
   ```solidity
   // Modify AnonymousLegalConsultation.sol
   ```

2. **Test Changes**
   ```bash
   npm test
   npm run test:coverage
   ```

3. **Deploy New Version**
   ```bash
   npm run deploy:sepolia
   ```

4. **Verify New Contract**
   ```bash
   npm run verify:sepolia
   ```

### Data Migration

For significant changes requiring data migration:

1. Deploy new contract with migration code
2. Call migration functions to transfer data
3. Update frontend to use new address
4. Document migration process

## Security Checklist

Before mainnet deployment:

- [ ] All tests passing (75+ tests)
- [ ] Code coverage ≥ 95%
- [ ] Security audit completed
- [ ] All linters passing
- [ ] Gas optimization verified
- [ ] Private keys secured
- [ ] Environment variables configured
- [ ] Testnet deployment successful

## Troubleshooting

### Common Issues

**1. Insufficient Funds**
```
Error: Sender account has insufficient gas
```
Solution: Add more ETH to wallet

**2. RPC Connection Failed**
```
Error: Could not connect to network
```
Solution: Check RPC URL in `.env`

**3. Contract Verification Failed**
```
Error: Verification failed
```
Solution: Ensure compiler version matches

**4. Deployment Timeout**
```
Error: Timeout waiting for transaction
```
Solution: Increase timeout or check network congestion

## Deployment Scripts

### Deploy to All Networks
```bash
# Local
npm run deploy:localhost

# Sepolia
npm run deploy:sepolia

# Zama
npm run deploy:zama
```

### Verify All Contracts
```bash
npm run verify:sepolia
```

### Check Deployment Status
```bash
npx hardhat run scripts/check-status.js --network sepolia
```

## Monitoring

### Contract Events
Subscribe to contract events:
```javascript
contract.on('ConsultationSubmitted', (event) => {
  console.log('New consultation:', event);
});
```

### Gas Tracking
```bash
npm run gas
```

### Balance Monitoring
```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

## Cost Estimation

### Typical Gas Costs

| Operation | Gas Used | Cost (Sepolia) |
|-----------|----------|---|
| Deploy Contract | ~1,200,000 | ~0.024 ETH |
| Register Lawyer | ~45,000 | ~0.0009 ETH |
| Submit Consultation | ~75,000 | ~0.0015 ETH |
| Assign Consultation | ~50,000 | ~0.001 ETH |

### Cost Reduction Tips
1. Batch operations where possible
2. Use events instead of storage
3. Optimize state variables
4. Deploy during low-traffic periods

## References

- [Hardhat Deployment](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [Etherscan Verification](https://docs.etherscan.io/tutorials/verifying-smart-contracts)
- [Web3 Deployment Best Practices](https://ethereum.org/en/developers/docs/smart-contracts/deploying/)
