#!/usr/bin/env ts-node
/**
 * Create FHEVM Example Repository Scaffolder
 *
 * This script automates the creation of standalone FHEVM example repositories with:
 * - Hardhat project setup with multi-network configuration
 * - Solidity contract injection with FHE patterns
 * - Comprehensive test suite generation
 * - Automated documentation from code annotations
 *
 * Usage: ts-node create-fhevm-example.ts <example-name> [output-dir]
 *
 * Examples:
 *   ts-node scripts/create-fhevm-example.ts access-control ./output/access-control-example
 *   ts-node scripts/create-fhevm-example.ts arithmetic ./output/arithmetic-example
 *
 * @author FHE Legal Consultation Platform
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

// Example configuration interface
interface ExampleConfig {
  contract: string;
  test: string;
  description: string;
  category: string;
}

// Map of example names to their contract and test paths
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'access-control': {
    contract: 'examples/contracts/AccessControlExample.sol',
    test: 'examples/test/AccessControlExample.test.js',
    description: 'Demonstrates FHE.allow() and FHE.allowTransient() for controlling encrypted data access',
    category: 'access-control',
  },
  'encryption': {
    contract: 'examples/contracts/EncryptionExample.sol',
    test: 'examples/test/EncryptionExample.test.js',
    description: 'Shows encrypted data structures and multiple encrypted types with FHE',
    category: 'encryption',
  },
  'arithmetic': {
    contract: 'examples/contracts/ArithmeticExample.sol',
    test: 'examples/test/ArithmeticExample.test.js',
    description: 'Demonstrates FHE arithmetic operations on encrypted values (add, sub, mul, eq, etc.)',
    category: 'arithmetic',
  },
  'user-decryption': {
    contract: 'examples/contracts/UserDecryptionExample.sol',
    test: 'examples/test/UserDecryptionExample.test.js',
    description: 'Shows user-controlled privacy where only the user holds decryption keys',
    category: 'user-decryption',
  },
  'public-decryption': {
    contract: 'examples/contracts/PublicDecryptionExample.sol',
    test: 'examples/test/PublicDecryptionExample.test.js',
    description: 'Demonstrates aggregating encrypted data with public result decryption',
    category: 'public-decryption',
  },
  'legal-consultation': {
    contract: 'contracts/AnonymousLegalConsultation.sol',
    test: 'test/AnonymousLegalConsultation.test.js',
    description: 'Complete privacy-preserving legal consultation platform with multiple FHE patterns',
    category: 'legal',
  },
};

/**
 * Validates example name to avoid restricted patterns
 *
 * Ensures project names don't contain restricted patterns
 *
 * @param name - Project name to validate
 * @returns boolean indicating if name is valid
 */
function validateExampleName(name: string): boolean {
  const restrictedPatterns = [
    /dapp\d+/i,
    /case\d+/i,
  ];

  return !restrictedPatterns.some(pattern => pattern.test(name));
}

function copyDirectoryRecursive(source: string, destination: string, excludeDirs: string[] = []): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (excludeDirs.includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function getContractName(contractPath: string): string | null {
  const content = fs.readFileSync(contractPath, 'utf-8');
  const match = content.match(/^\s*contract\s+(\w+)(?:\s+is\s+|\s*\{)/m);
  return match ? match[1] : null;
}

function generateDeployScript(contractName: string): string {
  return `const { ethers } = require("hardhat");

async function main() {
  console.log("\\n🚀 Deploying ${contractName}...\\n");

  const ${contractName} = await ethers.getContractFactory("${contractName}");
  const contract = await ${contractName}.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ ${contractName} deployed to:", contractAddress);
  console.log("\\n✅ Deployment successful!\\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
}

function generateReadme(exampleName: string, description: string, contractName: string, category: string): string {
  return `# FHEVM Example: ${exampleName}

${description}

## 📚 Chapter: ${category}

This example is part of the **${category}** pattern category, demonstrating privacy-preserving computation using Fully Homomorphic Encryption.

## Quick Start

### Prerequisites

- **Node.js**: Version 18.x or 20.x
- **npm**: Package manager
- **MetaMask**: For testnet deployment

### Installation

1. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**

   \`\`\`bash
   cp .env.example .env
   # Edit .env with your private key and RPC URLs
   \`\`\`

3. **Compile the contract**

   \`\`\`bash
   npm run compile
   \`\`\`

4. **Run tests**

   \`\`\`bash
   npm test
   \`\`\`

## Contract: ${contractName}

Located in \`contracts/${contractName}.sol\`

### Key Features

- ✅ FHE encrypted data types
- ✅ Access control with \`FHE.allow()\`
- ✅ Privacy-preserving computations
- ✅ Comprehensive test coverage

## Deployment

### Local Network

\`\`\`bash
# Start local node
npm run node

# Deploy contract
npm run deploy:localhost
\`\`\`

### Sepolia Testnet

\`\`\`bash
# Deploy contract
npm run deploy:sepolia

# Verify contract
npm run verify:sepolia
\`\`\`

## Testing

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run gas
\`\`\`

## Available Scripts

| Script | Description |
|--------|-------------|
| \`npm run compile\` | Compile the contract |
| \`npm test\` | Run test suite |
| \`npm run test:coverage\` | Generate coverage report |
| \`npm run clean\` | Clean build artifacts |
| \`npm run deploy:localhost\` | Deploy to local network |
| \`npm run deploy:sepolia\` | Deploy to Sepolia testnet |

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://docs.zama.org/protocol/examples)
- [Hardhat Documentation](https://hardhat.org/)

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using [FHEVM](https://github.com/zama-ai/fhevm) by Zama**
`;
}

function createExample(exampleName: string, outputDir: string): void {
  const rootDir = path.resolve(__dirname, '..');

  // Validate example name
  if (!EXAMPLES_MAP[exampleName]) {
    error(`Unknown example: ${exampleName}\n\nAvailable examples:\n${Object.keys(EXAMPLES_MAP).map(k => `  - ${k}: ${EXAMPLES_MAP[k].description}`).join('\n')}`);
  }

  if (!validateExampleName(exampleName)) {
    error(`Invalid project name '${exampleName}'. Names cannot contain restricted patterns.`);
  }

  const exampleConfig = EXAMPLES_MAP[exampleName];
  info(`Creating FHEVM example: ${exampleName}`);
  info(`Output directory: ${outputDir}`);

  // Check if output directory exists
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  // Step 1: Create base directory structure
  log('\n📋 Step 1: Creating base structure...', Color.Cyan);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'contracts'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'test'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'scripts'), { recursive: true });
  success('Base structure created');

  // Step 2: Copy contract
  log('\n📄 Step 2: Copying contract...', Color.Cyan);
  const fullContractPath = path.join(rootDir, exampleConfig.contract);
  if (!fs.existsSync(fullContractPath)) {
    error(`Contract not found: ${exampleConfig.contract}`);
  }

  const contractName = getContractName(fullContractPath);
  if (!contractName) {
    error(`Could not extract contract name from ${exampleConfig.contract}`);
  }

  const destContractPath = path.join(outputDir, 'contracts', `${contractName}.sol`);
  fs.copyFileSync(fullContractPath, destContractPath);
  success(`Contract copied: ${contractName}.sol`);

  // Step 3: Copy test
  log('\n🧪 Step 3: Copying test file...', Color.Cyan);
  const fullTestPath = path.join(rootDir, exampleConfig.test);
  if (fs.existsSync(fullTestPath)) {
    const testFileName = path.basename(exampleConfig.test);
    const destTestPath = path.join(outputDir, 'test', testFileName);
    fs.copyFileSync(fullTestPath, destTestPath);
    success(`Test copied: ${testFileName}`);
  } else {
    log(`Warning: Test file not found: ${exampleConfig.test}`, Color.Yellow);
  }

  // Step 4: Generate deployment script
  log('\n⚙️  Step 4: Generating deployment script...', Color.Cyan);
  const deployScript = generateDeployScript(contractName);
  fs.writeFileSync(path.join(outputDir, 'scripts', 'deploy.js'), deployScript);
  success('Deployment script generated');

  // Step 5: Copy configuration files
  log('\n📦 Step 5: Copying configuration files...', Color.Cyan);
  const configFiles = ['hardhat.config.js', 'package.json', '.env.example', '.gitignore'];
  configFiles.forEach(file => {
    const sourcePath = path.join(rootDir, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(outputDir, file));
      log(`  ✓ ${file}`, Color.Green);
    }
  });
  success('Configuration files copied');

  // Step 6: Update package.json
  log('\n📝 Step 6: Updating package.json...', Color.Cyan);
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.name = `fhe-example-${exampleName}`;
  packageJson.description = exampleConfig.description;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  success('package.json updated');

  // Step 7: Generate README
  log('\n📚 Step 7: Generating README...', Color.Cyan);
  const readme = generateReadme(exampleName, exampleConfig.description, contractName, exampleConfig.category);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  success('README.md generated');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM example "${exampleName}" created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\n📊 Example Summary:', Color.Cyan);
  log(`  Name: ${exampleName}`);
  log(`  Contract: ${contractName}`);
  log(`  Category: ${exampleConfig.category}`);
  log(`  Location: ${path.relative(process.cwd(), outputDir)}`);

  log('\n📦 Next steps:', Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log('  npm install');
  log('  npm run compile');
  log('  npm run test');

  log('\n🎉 Happy coding with FHEVM!', Color.Cyan);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Example Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]\n');
    log('Available examples:', Color.Yellow);
    Object.entries(EXAMPLES_MAP).forEach(([key, config]) => {
      log(`  ${key}`, Color.Green);
      log(`    Category: ${config.category}`, Color.Cyan);
      log(`    ${config.description}`, Color.Reset);
    });
    log('\nExamples:', Color.Yellow);
    log('  ts-node scripts/create-fhevm-example.ts access-control ./output/access-control');
    log('  ts-node scripts/create-fhevm-example.ts arithmetic ./output/arithmetic\n');
    process.exit(0);
  }

  const exampleName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `fhe-example-${exampleName}`);

  createExample(exampleName, outputDir);
}

main();
