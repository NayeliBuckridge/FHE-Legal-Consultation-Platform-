#!/usr/bin/env ts-node

/**
 * Create FHEVM Category Project - CLI tool to generate FHEVM projects with multiple examples from a category
 *
 * This script generates standalone Hardhat projects containing multiple related FHE examples.
 * Perfect for learning and understanding multiple privacy-preserving patterns in one project.
 *
 * Usage: ts-node scripts/create-fhevm-category.ts <category> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-category.ts legal ./output/legal-examples
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
  Magenta = '\x1b[35m',
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

// Contract item interface
interface ContractItem {
  path: string;
  test: string;
  fixture?: string;
  additionalFiles?: string[];
}

// Category configuration interface
interface CategoryConfig {
  name: string;
  description: string;
  contracts: ContractItem[];
  additionalDeps?: Record<string, string>;
}

// Category definitions
const CATEGORIES: Record<string, CategoryConfig> = {
  legal: {
    name: 'Legal Consultation FHE Examples',
    description: 'Privacy-preserving legal consultation platform demonstrating multiple FHE patterns',
    contracts: [
      { path: 'contracts/AnonymousLegalConsultation.sol', test: 'test/AnonymousLegalConsultation.test.js' },
      { path: 'examples/contracts/AccessControlExample.sol', test: 'examples/test/AccessControlExample.test.js' },
      { path: 'examples/contracts/EncryptionExample.sol', test: 'examples/test/EncryptionExample.test.js' },
      { path: 'examples/contracts/ArithmeticExample.sol', test: 'examples/test/ArithmeticExample.test.js' },
      { path: 'examples/contracts/UserDecryptionExample.sol', test: 'examples/test/UserDecryptionExample.test.js' },
      { path: 'examples/contracts/PublicDecryptionExample.sol', test: 'examples/test/PublicDecryptionExample.test.js' },
    ],
  },
  'access-control': {
    name: 'Access Control Pattern Examples',
    description: 'Demonstrating FHE.allow() and FHE.allowTransient() for controlling data access',
    contracts: [
      { path: 'examples/contracts/AccessControlExample.sol', test: 'examples/test/AccessControlExample.test.js' },
    ],
  },
  encryption: {
    name: 'Encryption Pattern Examples',
    description: 'Encrypted data structures and multiple encrypted types with FHE',
    contracts: [
      { path: 'examples/contracts/EncryptionExample.sol', test: 'examples/test/EncryptionExample.test.js' },
    ],
  },
  arithmetic: {
    name: 'Arithmetic Operations Examples',
    description: 'FHE arithmetic operations on encrypted values (add, sub, mul, eq, etc.)',
    contracts: [
      { path: 'examples/contracts/ArithmeticExample.sol', test: 'examples/test/ArithmeticExample.test.js' },
    ],
  },
  'user-decryption': {
    name: 'User Decryption Examples',
    description: 'User-controlled privacy where only the user holds decryption keys',
    contracts: [
      { path: 'examples/contracts/UserDecryptionExample.sol', test: 'examples/test/UserDecryptionExample.test.js' },
    ],
  },
  'public-decryption': {
    name: 'Public Decryption Examples',
    description: 'Aggregating encrypted data with public result decryption',
    contracts: [
      { path: 'examples/contracts/PublicDecryptionExample.sol', test: 'examples/test/PublicDecryptionExample.test.js' },
    ],
  },
};

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

function generateDeployScript(contractNames: string[]): string {
  return `const { ethers } = require("hardhat");

async function main() {
  console.log("\\n🚀 Deploying contracts...\\n");

${contractNames.map(name => `  // Deploy ${name}
  const ${name} = await ethers.getContractFactory("${name}");
  const ${name.toLowerCase()} = await ${name}.deploy();
  await ${name.toLowerCase()}.waitForDeployment();
  const ${name.toLowerCase()}Address = await ${name.toLowerCase()}.getAddress();
  console.log("✅ ${name} deployed to:", ${name.toLowerCase()}Address);
`).join('\n')}
  console.log("\\n✅ All contracts deployed successfully!\\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
}

function generateReadme(category: string, contractNames: string[]): string {
  const categoryInfo = CATEGORIES[category];

  return `# FHEVM Examples: ${categoryInfo.name}

${categoryInfo.description}

## 📦 Included Examples

This project contains ${contractNames.length} example contract${contractNames.length > 1 ? 's' : ''}:

${contractNames.map((name, i) => `${i + 1}. **${name}**`).join('\n')}

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

3. **Compile all contracts**

   \`\`\`bash
   npm run compile
   \`\`\`

4. **Run all tests**

   \`\`\`bash
   npm test
   \`\`\`

## Contracts

${contractNames.map(name => `### ${name}

Located in \`contracts/${name}.sol\`

Run specific tests:
\`\`\`bash
npx hardhat test test/${name}.test.js
\`\`\`
`).join('\n')}

## Deployment

### Local Network

\`\`\`bash
# Start local node
npm run node

# Deploy all contracts
npm run deploy:localhost
\`\`\`

### Sepolia Testnet

\`\`\`bash
# Deploy all contracts
npm run deploy:sepolia

# Verify contracts
npm run verify:sepolia
\`\`\`

## Available Scripts

| Script | Description |
|--------|-------------|
| \`npm run compile\` | Compile all contracts |
| \`npm test\` | Run all tests |
| \`npm run test:coverage\` | Generate coverage report |
| \`npm run lint\` | Run all linters |
| \`npm run clean\` | Clean build artifacts |
| \`npm run deploy:localhost\` | Deploy to local network |
| \`npm run deploy:sepolia\` | Deploy to Sepolia testnet |

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://docs.zama.org/protocol/examples)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using [FHEVM](https://github.com/zama-ai/fhevm) by Zama**
`;
}

function createCategoryProject(category: string, outputDir: string): void {
  const rootDir = path.resolve(__dirname, '..');

  // Validate category
  if (!CATEGORIES[category]) {
    error(`Unknown category: ${category}\n\nAvailable categories:\n${Object.keys(CATEGORIES).map(k => `  - ${k}: ${CATEGORIES[k].name}`).join('\n')}`);
  }

  const categoryInfo = CATEGORIES[category];
  info(`Creating FHEVM project: ${categoryInfo.name}`);
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

  // Step 2: Copy all contracts and tests from category
  log('\n📄 Step 2: Copying contracts and tests...', Color.Cyan);
  const contractNames: string[] = [];
  const copiedTests = new Set<string>();

  categoryInfo.contracts.forEach(({ path: contractPath, test: testPath }) => {
    // Copy contract
    const fullContractPath = path.join(rootDir, contractPath);
    if (!fs.existsSync(fullContractPath)) {
      log(`Warning: Contract not found: ${contractPath}`, Color.Yellow);
      return;
    }

    const contractName = getContractName(fullContractPath);
    if (contractName) {
      contractNames.push(contractName);
      const destContractPath = path.join(outputDir, 'contracts', `${contractName}.sol`);
      fs.copyFileSync(fullContractPath, destContractPath);
      log(`  ✓ ${contractName}.sol`, Color.Green);
    }

    // Copy test (avoid duplicates)
    const fullTestPath = path.join(rootDir, testPath);
    if (fs.existsSync(fullTestPath) && !copiedTests.has(testPath)) {
      const testFileName = path.basename(testPath);
      const destTestPath = path.join(outputDir, 'test', testFileName);
      fs.copyFileSync(fullTestPath, destTestPath);
      copiedTests.add(testPath);
      log(`  ✓ ${testFileName}`, Color.Green);
    }
  });

  success(`Copied ${contractNames.length} contracts and their tests`);

  // Step 3: Generate deployment script
  log('\n⚙️  Step 3: Generating deployment script...', Color.Cyan);
  const deployScript = generateDeployScript(contractNames);
  const deployPath = path.join(outputDir, 'scripts', 'deploy.js');
  fs.writeFileSync(deployPath, deployScript);
  success('Deployment script generated');

  // Step 4: Copy configuration files from root
  log('\n📦 Step 4: Copying configuration files...', Color.Cyan);
  const configFiles = ['hardhat.config.js', 'package.json', '.env.example', '.gitignore'];
  configFiles.forEach(file => {
    const sourcePath = path.join(rootDir, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(outputDir, file));
      log(`  ✓ ${file}`, Color.Green);
    }
  });
  success('Configuration files copied');

  // Step 5: Update package.json
  log('\n📝 Step 5: Updating package.json...', Color.Cyan);
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.name = `fhe-examples-${category}`;
  packageJson.description = categoryInfo.description;
  packageJson.homepage = `https://github.com/fhevm-examples/${category}`;

  // Add additional dependencies if needed
  if (categoryInfo.additionalDeps) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...categoryInfo.additionalDeps,
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  success('package.json updated');

  // Step 6: Generate README
  log('\n📚 Step 6: Generating README...', Color.Cyan);
  const readme = generateReadme(category, contractNames);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  success('README.md generated');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM ${categoryInfo.name} project created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\n📊 Project Summary:', Color.Magenta);
  log(`  Category: ${categoryInfo.name}`);
  log(`  Contracts: ${contractNames.length}`);
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
    log('FHEVM Category Project Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/create-fhevm-category.ts <category> [output-dir]\n');
    log('Available categories:', Color.Yellow);
    Object.entries(CATEGORIES).forEach(([key, info]) => {
      log(`  ${key}`, Color.Green);
      log(`    ${info.name}`, Color.Cyan);
      log(`    ${info.description}`, Color.Reset);
      log(`    Contracts: ${info.contracts.length}`, Color.Blue);
    });
    log('\nExamples:', Color.Yellow);
    log('  ts-node scripts/create-fhevm-category.ts legal ./output/legal-examples');
    log('  ts-node scripts/create-fhevm-category.ts access-control ./output/access-control-examples\n');
    process.exit(0);
  }

  const category = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `fhe-examples-${category}`);

  createCategoryProject(category, outputDir);
}

main();
