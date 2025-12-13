#!/usr/bin/env ts-node
/**
 * Documentation Generator from Code Annotations
 *
 * This script generates GitBook-compatible documentation from contracts and tests.
 * It extracts code, comments, and annotations to create comprehensive guides.
 *
 * Usage:
 *   ts-node scripts/generate-docs.ts <example-name>   # Generate docs for specific example
 *   ts-node scripts/generate-docs.ts --all            # Generate all documentation
 *
 * Examples:
 *   ts-node scripts/generate-docs.ts access-control
 *   ts-node scripts/generate-docs.ts --all
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

interface ExampleDoc {
  name: string;
  title: string;
  category: string;
  description: string;
  contractPath: string;
  testPath: string;
}

const EXAMPLES: ExampleDoc[] = [
  {
    name: 'access-control',
    title: 'Access Control Pattern',
    category: 'access-control',
    description: 'Demonstrating FHE.allow() and FHE.allowTransient() for controlling encrypted data access',
    contractPath: 'examples/contracts/AccessControlExample.sol',
    testPath: 'examples/test/AccessControlExample.test.js',
  },
  {
    name: 'encryption',
    title: 'Encryption Pattern',
    category: 'encryption',
    description: 'Encrypted data structures and multiple encrypted types with FHE',
    contractPath: 'examples/contracts/EncryptionExample.sol',
    testPath: 'examples/test/EncryptionExample.test.js',
  },
  {
    name: 'arithmetic',
    title: 'Arithmetic Operations',
    category: 'arithmetic',
    description: 'FHE arithmetic operations on encrypted values (add, sub, mul, eq, etc.)',
    contractPath: 'examples/contracts/ArithmeticExample.sol',
    testPath: 'examples/test/ArithmeticExample.test.js',
  },
  {
    name: 'user-decryption',
    title: 'User Decryption Pattern',
    category: 'user-decryption',
    description: 'User-controlled privacy where only the user holds decryption keys',
    contractPath: 'examples/contracts/UserDecryptionExample.sol',
    testPath: 'examples/test/UserDecryptionExample.test.js',
  },
  {
    name: 'public-decryption',
    title: 'Public Decryption Pattern',
    category: 'public-decryption',
    description: 'Aggregating encrypted data with public result decryption',
    contractPath: 'examples/contracts/PublicDecryptionExample.sol',
    testPath: 'examples/test/PublicDecryptionExample.test.js',
  },
];

function extractCodeSnippet(filePath: string, maxLines: number = 50): string {
  if (!fs.existsSync(filePath)) {
    return '// File not found';
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const snippet = lines.slice(0, maxLines).join('\n');

  if (lines.length > maxLines) {
    return snippet + '\n// ... (truncated)';
  }

  return snippet;
}

function generateExampleDoc(example: ExampleDoc, rootDir: string): string {
  const contractPath = path.join(rootDir, example.contractPath);
  const testPath = path.join(rootDir, example.testPath);

  const contractCode = extractCodeSnippet(contractPath, 80);
  const testCode = extractCodeSnippet(testPath, 60);

  return `# ${example.title}

## Overview

${example.description}

**Category**: \`chapter: ${example.category}\`

## Smart Contract

The contract demonstrates the ${example.category} pattern in FHEVM:

\`\`\`solidity
${contractCode}
\`\`\`

## Test Suite

Comprehensive tests showing both correct usage and common pitfalls:

\`\`\`javascript
${testCode}
\`\`\`

## Key Concepts

### What This Example Teaches

- ✅ Privacy-preserving computation with FHE
- ✅ Proper access control patterns
- ✅ Common pitfalls and how to avoid them
- ✅ Best practices for ${example.category}

### Use Cases

This pattern is useful for:
- Applications requiring encrypted data handling
- Privacy-preserving smart contracts
- Confidential business logic
- Secure multi-party computation

## Running the Example

### Prerequisites

- Node.js 18.x or 20.x
- Hardhat installed
- Basic understanding of Solidity and TypeScript

### Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd FHELegalConsultation
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Compile contracts**
   \`\`\`bash
   npm run compile
   \`\`\`

4. **Run tests**
   \`\`\`bash
   npm test
   \`\`\`

## Common Patterns

### ✅ Correct Usage

\`\`\`solidity
// Grant both contract and user permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, user);
\`\`\`

### ❌ Common Mistakes

\`\`\`solidity
// Missing allowThis - will fail!
FHE.allow(encryptedValue, user);
\`\`\`

## Related Examples

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [All Examples](README.md)
- [Quick Start Guide](../quick-start.md)

## References

- [Zama FHEVM](https://github.com/zama-ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm-solidity)
- [Example Applications](https://github.com/zama-ai/dapps)

---

**Next Steps**: Explore other examples or try modifying this code for your use case!
`;
}

function generateExamplesIndex(): string {
  return `# Examples Overview

This section contains detailed examples demonstrating various FHEVM patterns and use cases.

## Available Examples

${EXAMPLES.map((ex, i) => `### ${i + 1}. [${ex.title}](${ex.name}.md)

**Category**: \`${ex.category}\`

${ex.description}

[View Example →](${ex.name}.md)
`).join('\n')}

## Learning Path

We recommend following this order for learning:

1. **[Encryption Pattern](encryption.md)** - Start with basic encryption
2. **[Access Control](access-control.md)** - Learn permission management
3. **[Arithmetic Operations](arithmetic.md)** - Perform calculations on encrypted data
4. **[User Decryption](user-decryption.md)** - User-controlled privacy
5. **[Public Decryption](public-decryption.md)** - Public result aggregation

## Quick Reference

| Pattern | Use Case | Difficulty |
|---------|----------|------------|
| Encryption | Basic encrypted storage | ⭐ Beginner |
| Access Control | Permission management | ⭐⭐ Intermediate |
| Arithmetic | Encrypted calculations | ⭐⭐ Intermediate |
| User Decryption | Private user data | ⭐⭐⭐ Advanced |
| Public Decryption | Public aggregation | ⭐⭐⭐ Advanced |

## Additional Resources

- [FHEVM Concepts](../concepts.md)
- [Quick Start Guide](../quick-start.md)
- [Architecture Overview](../architecture.md)

---

**Ready to dive in?** Start with the [Encryption Pattern](encryption.md)!
`;
}

function updateSummary(outputDir: string): void {
  const summaryPath = path.join(outputDir, 'SUMMARY.md');

  const summary = `# Table of Contents

* [Introduction](README.md)
* [FHEVM Concepts](concepts.md)
* [Quick Start](quick-start.md)
* [Examples Overview](examples/README.md)
* [Category Examples](examples/README.md#category-examples)
${EXAMPLES.map(ex => `  * [${ex.title}](examples/${ex.name}.md)`).join('\n')}
* [Architecture](architecture.md)
* [Testing Guide](testing.md)
* [Deployment Guide](deployment.md)
* [Security Best Practices](security.md)
* [Troubleshooting](troubleshooting.md)
* [Contributing](contributing.md)
* [Resources](resources.md)
`;

  fs.writeFileSync(summaryPath, summary);
  success('Updated SUMMARY.md');
}

function generateDocumentation(exampleName: string | null, rootDir: string): void {
  const outputDir = path.join(rootDir, 'docs', 'gitbook');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Ensure examples subdirectory exists
  const examplesDir = path.join(outputDir, 'examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  if (exampleName === null || exampleName === '--all') {
    // Generate all documentation
    info('Generating documentation for all examples...\n');

    EXAMPLES.forEach(example => {
      log(`📝 Generating: ${example.title}`, Color.Cyan);
      const doc = generateExampleDoc(example, rootDir);
      const outputPath = path.join(examplesDir, `${example.name}.md`);
      fs.writeFileSync(outputPath, doc);
      success(`  ✓ Created ${example.name}.md`);
    });

    // Generate index
    log('\n📚 Generating examples index...', Color.Cyan);
    const index = generateExamplesIndex();
    fs.writeFileSync(path.join(examplesDir, 'README.md'), index);
    success('  ✓ Created examples/README.md');

    // Update SUMMARY.md
    log('\n📖 Updating SUMMARY.md...', Color.Cyan);
    updateSummary(outputDir);

    log('\n' + '='.repeat(60), Color.Green);
    success('All documentation generated successfully!');
    log('='.repeat(60), Color.Green);

    log(`\n📊 Generated ${EXAMPLES.length} example documentation files`, Color.Cyan);
    log(`📍 Location: ${path.relative(process.cwd(), examplesDir)}`, Color.Blue);

  } else {
    // Generate single example documentation
    const example = EXAMPLES.find(ex => ex.name === exampleName);

    if (!example) {
      error(`Unknown example: ${exampleName}\n\nAvailable examples:\n${EXAMPLES.map(ex => `  - ${ex.name}`).join('\n')}`);
    }

    info(`Generating documentation for: ${example.title}\n`);

    const doc = generateExampleDoc(example, rootDir);
    const outputPath = path.join(examplesDir, `${example.name}.md`);
    fs.writeFileSync(outputPath, doc);

    success(`Documentation generated: ${example.name}.md`);
    log(`📍 Location: ${path.relative(process.cwd(), outputPath)}`, Color.Blue);
  }

  log('\n✨ Documentation generation complete!', Color.Green);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);
  const rootDir = path.resolve(__dirname, '..');

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Documentation Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/generate-docs.ts [example-name | --all]\n');
    log('Options:', Color.Yellow);
    log('  --all              Generate documentation for all examples');
    log('  <example-name>     Generate documentation for specific example');
    log('  --help, -h         Show this help message\n');
    log('Available examples:', Color.Yellow);
    EXAMPLES.forEach(ex => {
      log(`  ${ex.name}`, Color.Green);
      log(`    ${ex.description}`, Color.Reset);
    });
    log('\nExamples:', Color.Yellow);
    log('  ts-node scripts/generate-docs.ts --all');
    log('  ts-node scripts/generate-docs.ts access-control\n');
    process.exit(0);
  }

  const exampleName = args[0] === '--all' ? '--all' : args[0];
  generateDocumentation(exampleName === '--all' ? null : exampleName, rootDir);
}

main();
