const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify AnonymousLegalConsultation Contract on Etherscan
 *
 * This script verifies the deployed contract on Etherscan
 * using the deployment information saved during deployment.
 */
async function main() {
  console.log("🔍 Starting contract verification...\n");

  const network = hre.network.name;

  // Check if network supports verification
  if (network === "hardhat" || network === "localhost") {
    console.log("⚠️  Cannot verify contracts on local networks");
    console.log("   Please use sepolia or mainnet for verification");
    return;
  }

  console.log("📋 Verification Configuration:");
  console.log("─".repeat(50));
  console.log(`Network: ${network}`);
  console.log("─".repeat(50));
  console.log("");

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentPath = path.join(
    deploymentsDir,
    `${network}-deployment.json`
  );

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      `❌ Deployment file not found: ${deploymentPath}\n` +
        `   Please deploy the contract first using:\n` +
        `   npx hardhat run scripts/deploy.js --network ${network}`
    );
  }

  // Read deployment information
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  const constructorArgs = deploymentInfo.constructorArgs || [];

  console.log("📍 Contract Information:");
  console.log("─".repeat(50));
  console.log(`Contract Name:    ${deploymentInfo.contractName}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer:         ${deploymentInfo.deployer}`);
  console.log(`Deployment Time:  ${deploymentInfo.deploymentTime}`);
  console.log("─".repeat(50));
  console.log("");

  // Verify contract
  try {
    console.log("⏳ Submitting contract for verification...");
    console.log("   This may take a few moments...\n");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });

    console.log("✅ Contract verified successfully!\n");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTime = new Date().toISOString();
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("📝 Verification Information:");
    console.log("─".repeat(50));
    console.log("Status: Verified ✅");
    console.log(`Time:   ${deploymentInfo.verificationTime}`);
    console.log("─".repeat(50));
    console.log("");

    // Display Etherscan link
    if (network === "sepolia") {
      console.log("🔗 View Verified Contract:");
      console.log(
        `   https://sepolia.etherscan.io/address/${contractAddress}#code`
      );
      console.log("");
    }

    console.log("✨ You can now interact with the verified contract!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contract is already verified on Etherscan\n");

      if (network === "sepolia") {
        console.log("🔗 View Verified Contract:");
        console.log(
          `   https://sepolia.etherscan.io/address/${contractAddress}#code`
        );
        console.log("");
      }
    } else {
      throw error;
    }
  }
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:");
    console.error(error.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("   1. Check if ETHERSCAN_API_KEY is set in .env file");
    console.log("   2. Ensure the contract was deployed recently");
    console.log("   3. Wait a few blocks after deployment before verifying");
    console.log("   4. Verify constructor arguments match deployment");
    process.exit(1);
  });
