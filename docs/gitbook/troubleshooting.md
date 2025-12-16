# Troubleshooting Guide

## Common Issues and Solutions

### Installation & Setup

#### Issue: npm install fails
**Symptoms**:
```
npm ERR! code E...
npm ERR! 404 Not Found...
```

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Update npm:
   ```bash
   npm install -g npm@latest
   ```

3. Use npm registry:
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

#### Issue: Node version incompatible
**Symptoms**:
```
The engine "node" is incompatible...
```

**Solutions**:
1. Check Node version:
   ```bash
   node --version  # Should be 18.x or 20.x
   ```

2. Install Node.js 20:
   - [Download Node.js 20 LTS](https://nodejs.org/)

3. Use nvm (Node Version Manager):
   ```bash
   nvm install 20
   nvm use 20
   ```

#### Issue: Dependency conflicts
**Symptoms**:
```
peer dependencies not met...
```

**Solutions**:
1. Force installation:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Remove package-lock.json and reinstall:
   ```bash
   rm package-lock.json
   npm install
   ```

### Compilation Issues

#### Issue: Solidity compilation fails
**Symptoms**:
```
Error: ParserError: Expected '...'
```

**Solutions**:
1. Check Solidity version:
   ```bash
   npm list solc
   ```

2. Update compiler:
   ```bash
   npm install --save-dev hardhat@latest
   ```

3. Fix syntax errors:
   - Review error line number
   - Check for missing semicolons
   - Verify bracket matching

#### Issue: Contract import errors
**Symptoms**:
```
ParserError: Source "@fhevm/..." not found
```

**Solutions**:
1. Install FHEVM dependencies:
   ```bash
   npm install @fhevm/solidity
   ```

2. Check hardhat.config.js paths:
   ```javascript
   solidity: {
     version: "0.8.24",
     settings: {
       // ... settings
     }
   }
   ```

### Testing Issues

#### Issue: Tests timeout
**Symptoms**:
```
Error: Timeout of 20000ms exceeded
```

**Solutions**:
1. Increase timeout:
   ```bash
   npx hardhat test --timeout 60000
   ```

2. Check for infinite loops:
   - Review test code
   - Add debug logging
   - Simplify test cases

3. Increase memory:
   ```bash
   NODE_MAX_OLD_SPACE_SIZE=4096 npm test
   ```

#### Issue: Tests fail with encryption errors
**Symptoms**:
```
Error: Invalid encrypted input
Error: Input proof verification failed
```

**Solutions**:
1. Verify encryption binding:
   ```javascript
   // Ensure proof matches contract address
   const encrypted = await fhevm.createEncryptedInput(
     contractAddress,  // Must match contract being called
     userAddress
   ).add32(123).encrypt();
   ```

2. Check signer consistency:
   ```javascript
   // Encryption signer must match transaction signer
   const enc = await fhevm.createEncryptedInput(contractAddress, alice.address)
     .add32(123).encrypt();
   await contract.connect(alice).submit(enc.handles[0], enc.inputProof);
   ```

#### Issue: Coverage report incomplete
**Symptoms**:
```
Coverage missing for some lines
```

**Solutions**:
1. Add missing tests:
   ```javascript
   it('should cover edge case', async () => {
     // Test missing scenarios
   });
   ```

2. Run coverage explicitly:
   ```bash
   npm run test:coverage
   ```

### Deployment Issues

#### Issue: Insufficient gas
**Symptoms**:
```
Error: intrinsic gas too low
```

**Solutions**:
1. Increase gas limit in hardhat.config.js:
   ```javascript
   networks: {
     sepolia: {
       gasPrice: "auto",
       gas: 5000000
     }
   }
   ```

2. Reduce contract size:
   - Split into multiple contracts
   - Remove unnecessary code
   - Use libraries

#### Issue: Account has insufficient funds
**Symptoms**:
```
Error: Sender account has insufficient gas
```

**Solutions**:
1. Get testnet ETH:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Faucet](https://www.infura.io/faucet)
   - [Alchemy Faucet](https://www.alchemy.com/faucets)

2. Check balance:
   ```bash
   npx hardhat run scripts/check-balance.js --network sepolia
   ```

#### Issue: Contract verification fails
**Symptoms**:
```
Error: Etherscan verification failed
```

**Solutions**:
1. Verify compiler version matches:
   ```bash
   npx hardhat verify --list-networks
   ```

2. Check constructor arguments:
   ```javascript
   // If contract has constructor args, they must be encoded
   npx hardhat verify --constructor-args args.js 0x...
   ```

3. Wait for block confirmations:
   ```bash
   # Usually needs 6+ block confirmations
   # Try verification after waiting
   ```

### RPC & Network Issues

#### Issue: RPC URL not responding
**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:8545
```

**Solutions**:
1. Check if local node is running:
   ```bash
   npm run node  # In separate terminal
   ```

2. Verify RPC URL in .env:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   ```

3. Test RPC connectivity:
   ```javascript
   const provider = new ethers.JsonRpcProvider(rpcUrl);
   const blockNumber = await provider.getBlockNumber();
   console.log('Connected. Latest block:', blockNumber);
   ```

#### Issue: Network connection timeout
**Symptoms**:
```
Error: Network timeout
```

**Solutions**:
1. Check internet connection
2. Try different RPC provider
3. Increase timeout in hardhat.config.js:
   ```javascript
   networks: {
     sepolia: {
       timeout: 60000  // 60 seconds
     }
   }
   ```

### Runtime Issues

#### Issue: View function with encrypted value fails
**Symptoms**:
```
Error: View functions cannot have encrypted returns
```

**Solutions**:
1. Convert view function to transaction:
   ```solidity
   // ❌ WRONG
   function getSecret() public view returns (euint32) {
     return secret;
   }

   // ✅ CORRECT
   function getSecret() public returns (euint32) {
     FHE.allow(secret, msg.sender);
     return secret;
   }
   ```

#### Issue: Missing FHE.allowThis()
**Symptoms**:
```
Error: Contract doesn't have permission to use encrypted value
```

**Solutions**:
1. Add FHE.allowThis() before operations:
   ```solidity
   // ❌ WRONG
   euint32 result = FHE.add(a, b);

   // ✅ CORRECT
   euint32 result = FHE.add(a, b);
   FHE.allowThis(result);
   ```

### Performance Issues

#### Issue: Slow test execution
**Symptoms**:
```
Tests taking > 30 seconds
```

**Solutions**:
1. Check for large data operations:
   - Reduce test data size
   - Parallelize tests

2. Use describe.only to run specific tests:
   ```javascript
   describe.only('Feature', () => {
     // Only these tests run
   });
   ```

3. Profile test execution:
   ```bash
   npm test -- --reporter json > test-results.json
   ```

#### Issue: High gas consumption
**Symptoms**:
```
Functions using more gas than expected
```

**Solutions**:
1. Optimize storage:
   - Use uint256 instead of uint32 when possible
   - Pack state variables efficiently

2. Minimize FHE operations:
   - Batch operations
   - Cache results

3. Review gas report:
   ```bash
   npm run gas
   ```

### Environment Issues

#### Issue: .env file not loading
**Symptoms**:
```
Error: PRIVATE_KEY is undefined
```

**Solutions**:
1. Verify .env file exists:
   ```bash
   ls -la .env
   ```

2. Ensure hardhat.config.js loads .env:
   ```javascript
   require('dotenv').config();
   ```

3. Check variable names match:
   ```env
   PRIVATE_KEY=your_key  # Matches process.env.PRIVATE_KEY
   ```

#### Issue: Private key exposed
**Symptoms**:
```
Warning: Private key visible in logs
```

**Solutions**:
1. Never commit .env:
   ```
   .env
   .env.local
   ```

2. Use secret management:
   - GitHub Secrets for CI/CD
   - HashiCorp Vault for production

3. Rotate exposed keys immediately

### Integration Issues

#### Issue: Contract doesn't respond to calls
**Symptoms**:
```
Error: call revert
```

**Solutions**:
1. Check contract address:
   ```bash
   npx hardhat run scripts/check-address.js
   ```

2. Verify contract is deployed:
   ```javascript
   const code = await provider.getCode(contractAddress);
   console.log('Code length:', code.length);
   ```

3. Check function exists:
   ```bash
   npx hardhat run scripts/check-abi.js
   ```

## Debug Tools

### Hardhat Console
```javascript
// In your contract
import "hardhat/console.sol";

function debug() public {
  console.log("Value:", value);
  console.log("Address:", msg.sender);
}
```

### Logging
```javascript
// In tests
console.log('Contract:', contract.address);
console.log('Balance:', balance);
console.log('Result:', result);
```

### Block Explorer
- [Etherscan](https://etherscan.io/) - Mainnet
- [Sepolia Etherscan](https://sepolia.etherscan.io/) - Sepolia testnet
- Check transaction status
- View contract code
- Monitor events

## Getting Help

### Community Support
- [FHEVM Discord](https://discord.gg/zama)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions)

### Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Report Issues
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)
- [Bug Bounty Program](https://www.zama.ai/bounty-program)

## Frequently Asked Questions

**Q: How do I reset the local node?**
A: Stop the node and restart with `npm run node`

**Q: Can I use this on mainnet?**
A: Not yet. Zama is actively developing mainnet support.

**Q: How do I back up my private key?**
A: Never store private keys. Use hardware wallets or secret managers.

**Q: How long do tests take?**
A: Typically 10-15 seconds for full test suite
