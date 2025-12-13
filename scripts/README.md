# Automation Scripts Documentation

This directory contains TypeScript and JavaScript scripts for automating common development and deployment tasks.

## Available Scripts

### 1. `create-fhevm-example.ts` - Example Repository Generator

Generates standalone FHEVM example repositories.

#### Usage

```bash
npm run create-example <example-name> [output-dir]
```

Or directly:

```bash
ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
```

#### Available Examples

- `access-control` - Access control pattern demonstration
- `encryption` - Encryption pattern demonstration
- `arithmetic` - Arithmetic operations on encrypted data
- `user-decryption` - User-controlled privacy
- `public-decryption` - Public aggregation patterns
- `legal-consultation` - Complete legal consultation platform

#### Example

```bash
# Create access-control example
npm run create-example access-control ./output/access-control-example

# Create encryption example
npm run create-example encryption ./output/encryption-example
```

#### Output

Creates a standalone project with:
- Solidity contract
- Test suite
- Deployment script
- Package configuration
- README documentation

### 2. `create-fhevm-category.ts` - Category Project Generator

Generates projects with multiple related examples.

#### Usage

```bash
npm run create-category <category> [output-dir]
```

Or directly:

```bash
ts-node scripts/create-fhevm-category.ts <category> [output-dir]
```

#### Available Categories

- `legal` - Complete legal consultation examples (6 contracts)
- `access-control` - Access control patterns (1 contract)
- `encryption` - Encryption patterns (1 contract)
- `arithmetic` - Arithmetic operations (1 contract)
- `user-decryption` - User decryption patterns (1 contract)
- `public-decryption` - Public decryption patterns (1 contract)

#### Example

```bash
# Create legal examples category
npm run create-category legal ./output/legal-examples

# Create access-control category
npm run create-category access-control ./output/access-control-examples
```

#### Output

Creates a category project with:
- Multiple smart contracts
- Comprehensive tests for all contracts
- Unified deployment script
- Category-specific README

### 3. `generate-docs.ts` - Documentation Generator

Generates GitBook-compatible documentation from contracts and tests.

#### Usage

```bash
npm run generate:docs [example-name]
npm run generate:docs:all
```

Or directly:

```bash
ts-node scripts/generate-docs.ts --all
ts-node scripts/generate-docs.ts access-control
```

#### Options

- `--all` - Generate documentation for all examples
- `<example-name>` - Generate docs for specific example
- `--help, -h` - Show help message

#### Examples

```bash
# Generate all documentation
npm run generate:docs:all

# Generate docs for specific example
npm run generate:docs access-control
npm run generate:docs encryption
```

#### Output

Creates:
- Individual markdown files for each example
- Examples index (`examples/README.md`)
- Updated `SUMMARY.md`
- GitBook-compatible structure

### 4. `deploy.js` - Deployment Script

Deploys contracts to configured networks.

#### Usage

```bash
npm run deploy:localhost
npm run deploy:sepolia
npm run deploy:zama
```

Or directly:

```bash
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network zama
```

#### Features

- Deploys main contract
- Deploys example contracts
- Outputs contract addresses
- Saves deployment information

### 5. `verify.js` - Contract Verification Script

Verifies deployed contracts on Etherscan.

#### Usage

```bash
npm run verify:sepolia
```

Or directly:

```bash
npx hardhat run scripts/verify.js --network sepolia
```

#### Features

- Verifies contract source code
- Makes contract visible on explorer
- Confirms deployment status

### 6. `interact.js` - Interactive CLI

Provides interactive menu for contract interaction.

#### Usage

```bash
npm run interact:localhost
npm run interact:sepolia
npm run interact:zama
```

Or directly:

```bash
npx hardhat run scripts/interact.js --network sepolia
```

#### Features

- Register lawyers
- Submit consultations
- View data
- Test contract functions

### 7. `simulate.js` - Workflow Simulation

Simulates complete consultation workflow for testing.

#### Usage

```bash
npm run simulate:localhost
npm run simulate:sepolia
```

Or directly:

```bash
npx hardhat run scripts/simulate.js --network sepolia
```

#### Features

- Creates multiple test scenarios
- Simulates complete workflow
- Tests all major functions
- Validates results

## NPM Scripts

### Quick Reference

```bash
# Generate examples
npm run create-example <name>      # Single example
npm run create-category <category> # Category project

# Generate documentation
npm run generate:docs <name>       # Specific example
npm run generate:docs:all          # All examples

# Deploy and verify
npm run deploy:localhost
npm run deploy:sepolia
npm run verify:sepolia

# Interact and test
npm run interact:sepolia
npm run simulate:sepolia
```

## Configuration

### TypeScript Scripts

Scripts use `ts-node` for direct TypeScript execution:

```bash
# All scripts can be run directly
ts-node scripts/create-fhevm-example.ts --help
ts-node scripts/create-fhevm-category.ts --help
ts-node scripts/generate-docs.ts --help
```

### Environment Variables

Create `.env` file with:

```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ZAMA_RPC_URL=https://zama-rpc.url
ETHERSCAN_API_KEY=your_api_key
```

## Development Workflow

### 1. Create New Example

```bash
# Generate standalone example
npm run create-example my-example ./output/my-example

# Navigate to generated project
cd output/my-example

# Install and test
npm install
npm run compile
npm run test
```

### 2. Create Category Project

```bash
# Generate category with multiple examples
npm run create-category legal ./output/legal-examples

# Test generated project
cd output/legal-examples
npm install
npm run compile
npm run test
```

### 3. Generate Documentation

```bash
# Generate all docs
npm run generate:docs:all

# Check output
ls docs/gitbook/examples/

# Build GitBook (optional)
# npm install -g gitbook-cli
# gitbook build docs/gitbook/
```

### 4. Deploy and Verify

```bash
# Deploy to testnet
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia

# Interact with contract
npm run interact:sepolia
```

## Best Practices

### Script Execution

1. **Always test locally first**
   ```bash
   npm run deploy:localhost
   npm run test
   ```

2. **Verify before mainnet**
   ```bash
   npm run deploy:sepolia
   npm run verify:sepolia
   ```

3. **Use appropriate networks**
   - `localhost` - Local testing
   - `sepolia` - Testnet deployment
   - `zama` - Zama network testing

### Error Handling

If scripts fail:

1. Check error message
2. Verify configuration (`.env`)
3. Ensure contracts compile
4. Check network connectivity
5. Review [Troubleshooting Guide](../docs/gitbook/troubleshooting.md)

### Performance

- Local scripts execute quickly
- Testnet operations may take 30-60 seconds
- Use `--verbose` flag for detailed output

## Maintenance

### Updating Dependencies

```bash
npm install @fhevm/solidity@latest
npm install hardhat@latest
npm audit fix
```

### Modifying Scripts

When updating scripts:

1. Test changes locally
2. Update documentation
3. Verify all options work
4. Test with different inputs

## Troubleshooting

### Common Issues

**Script not found**
```
Error: Cannot find module 'ts-node'
```
Solution: Install dependencies
```bash
npm install
```

**Permission denied**
```
Permission denied: ./scripts/deploy.js
```
Solution: Make executable
```bash
chmod +x scripts/deploy.js
```

**RPC connection failed**
```
Error: could not connect to RPC
```
Solution: Check `.env` RPC URLs

## Resources

- [Create Examples Guide](../docs/gitbook/quick-start.md)
- [Deployment Guide](../docs/gitbook/deployment.md)
- [Architecture Documentation](../docs/gitbook/architecture.md)

## Contributing

To add or modify scripts:

1. Follow existing patterns
2. Include comprehensive comments
3. Update this README
4. Test thoroughly
5. Submit pull request

## Support

For questions about scripts:
- Check script help: `ts-node scripts/script-name.ts --help`
- Review documentation
- Check [Troubleshooting Guide](../docs/gitbook/troubleshooting.md)
- Ask on [Discord](https://discord.gg/zama)
