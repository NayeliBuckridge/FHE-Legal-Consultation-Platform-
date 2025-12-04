const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy AnonymousLegalConsultation Contract
 *
 * This script deploys the AnonymousLegalConsultation smart contract
 * to the specified network and saves deployment information.
 */
async function main() {
  console.log("🚀 Starting deployment process...\n");

  // Get network information
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Configuration:");
  console.log("─".repeat(50));
  console.log(`Network:          ${network}`);
  console.log(`Deployer:         ${deployer.address}`);
  console.log(`Balance:          ${hre.ethers.formatEther(balance)} ETH`);
  console.log("─".repeat(50));
  console.log("");

  // Check balance
  if (balance === 0n) {
    throw new Error("❌ Deployer account has zero balance. Please fund the account.");
  }

  // Get contract factory
  console.log("📦 Getting contract factory...");
  const AnonymousLegalConsultation = await hre.ethers.getContractFactory(
    "AnonymousLegalConsultation"
  );

  // Deploy contract
  console.log("⏳ Deploying AnonymousLegalConsultation contract...");
  const startTime = Date.now();

  const contract = await AnonymousLegalConsultation.deploy();
  await contract.waitForDeployment();

  const deploymentTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed successfully!\n");

  // Display deployment information
  console.log("📍 Deployment Information:");
  console.log("─".repeat(50));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployment Time:  ${deploymentTime}s`);
  console.log(`Transaction Hash: ${contract.deploymentTransaction().hash}`);
  console.log(`Block Number:     ${contract.deploymentTransaction().blockNumber || 'Pending'}`);
  console.log("─".repeat(50));
  console.log("");

  // Get initial contract state
  console.log("📊 Initial Contract State:");
  console.log("─".repeat(50));
  const admin = await contract.admin();
  const stats = await contract.getSystemStats();

  console.log(`Admin:               ${admin}`);
  console.log(`Total Consultations: ${stats[0]}`);
  console.log(`Total Lawyers:       ${stats[1]}`);
  console.log(`Verified Lawyers:    ${stats[2]}`);
  console.log("─".repeat(50));
  console.log("");

  // Save deployment information
  const deploymentInfo = {
    network: network,
    contractName: "AnonymousLegalConsultation",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash,
    blockNumber: contract.deploymentTransaction().blockNumber,
    admin: admin,
    constructorArgs: [],
    compiler: {
      version: "0.8.24",
      optimizer: true,
      runs: 200,
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment information to file
  const deploymentPath = path.join(
    deploymentsDir,
    `${network}-deployment.json`
  );
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`💾 Deployment information saved to: ${deploymentPath}\n`);

  // Display next steps
  console.log("📝 Next Steps:");
  console.log("─".repeat(50));
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat run scripts/verify.js --network ${network}`);
  console.log("");
  console.log("2. Interact with the contract:");
  console.log(`   npx hardhat run scripts/interact.js --network ${network}`);
  console.log("");
  console.log("3. Run simulation:");
  console.log(`   npx hardhat run scripts/simulate.js --network ${network}`);
  console.log("─".repeat(50));
  console.log("");

  // Display Etherscan link (if applicable)
  if (network === "sepolia") {
    console.log("🔍 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("");
  } else if (network === "zama") {
    console.log("🔍 Contract deployed on Zama Devnet");
    console.log(`   Address: ${contractAddress}`);
    console.log("");
  }

  return contractAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
