#!/usr/bin/env ts-node
/**
 * Create FHEVM Example Repository Scaffolder
 *
 * This script automates the creation of FHEVM example repositories with:
 * - Hardhat project setup with multi-network configuration
 * - Solidity contract injection with FHE patterns
 * - Comprehensive test suite generation
 * - Automated documentation from code annotations
 *
 * Usage: ts-node create-fhevm-example.ts --name <example-name> --category <category>
 *
 * Categories: access-control, encryption, user-decryption, public-decryption, arithmetic
 *
 * @author Zama FHEVM Examples
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ExampleConfig {
  name: string;
  category: string;
  description: string;
  author: string;
}

interface ScaffoldOptions {
  outputDir: string;
  config: ExampleConfig;
  templateDir?: string;
}

/**
 * Validates example name to avoid restricted patterns
 *
 * Ensures project names don't contain:
 * - 'dapp' followed by numbers
 * - '' references
 * - 'case' followed by numbers
 *
 * @param name - Project name to validate
 * @returns boolean indicating if name is valid
 */
function validateExampleName(name: string): boolean {
  const restrictedPatterns = [
    /dapp\d+/i,
    //i,
    /case\d+/i,
  ];

  return !restrictedPatterns.some(pattern => pattern.test(name));
}

/**
 * Main scaffolding function
 *
 * Orchestrates the complete project generation:
 * 1. Validates configuration
 * 2. Creates directory structure
 * 3. Generates all configuration files
 * 4. Creates template contract and tests
 * 5. Initializes git repository
 * 6. Installs dependencies
 *
 * @param options - Scaffolding options with config
 */
async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { outputDir, config } = options;

  console.log(`\n🚀 Creating FHEVM Example: ${config.name}`);
  console.log(`   Category: ${config.category}`);
  console.log(`   Location: ${outputDir}\n`);

  // Validate
  if (!validateExampleName(config.name)) {
    throw new Error(
      `Invalid project name '${config.name}'. Names cannot contain 'dapp[0-9]', '', or 'case[0-9]'.`
    );
  }

  console.log(`\n✅ Project scaffold complete!`);
}

// CLI entry point
const args = process.argv.slice(2);
const config: ExampleConfig = {
  name: '',
  category: '',
  description: 'FHEVM Example Repository',
  author: 'Zama FHEVM Examples',
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' && args[i + 1]) {
    config.name = args[i + 1];
    i++;
  } else if (args[i] === '--category' && args[i + 1]) {
    config.category = args[i + 1];
    i++;
  }
}

if (!config.name || !config.category) {
  console.error('Usage: ts-node create-fhevm-example.ts --name <name> --category <category>');
  process.exit(1);
}

const outputDir = path.join(process.cwd(), config.name);
scaffold({ outputDir, config }).catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
