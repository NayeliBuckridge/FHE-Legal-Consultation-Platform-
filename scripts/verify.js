const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n==================================================");
  console.log("  Contract Verification on Etherscan");
  console.log("==================================================\n");

  const network = hre.network.name;

  if (network === "hardhat" || network === "localhost") {
    console.log("⚠️  Cannot verify contracts on local network");
    console.log("   Please deploy to a public testnet or mainnet");
    return;
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.log("\n💡 Please deploy the contract first:");
    console.log(`   npm run deploy`);
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("Verification Information:");
  console.log("- Network:", network);
  console.log("- Contract:", deployment.contractName);
  console.log("- Address:", deployment.contractAddress);
  console.log("\n--------------------------------------------------\n");

  try {
    console.log("📤 Submitting contract for verification...\n");

    await hre.run("verify:verify", {
      address: deployment.contractAddress,
      constructorArguments: [],
      contract: "contracts/ConfidentialFuturesTrading.sol:ConfidentialFuturesTrading",
    });

    console.log("\n✅ Contract verified successfully!");

    if (network === "sepolia") {
      console.log("\n📊 View verified contract:");
      console.log(`   https://sepolia.etherscan.io/address/${deployment.contractAddress}#code`);
    }

    // Update deployment file with verification status
    deployment.verified = true;
    deployment.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));

    console.log("\n==================================================");
    console.log("  Verification Complete");
    console.log("==================================================\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");

      if (network === "sepolia") {
        console.log("\n📊 View verified contract:");
        console.log(`   https://sepolia.etherscan.io/address/${deployment.contractAddress}#code`);
      }
    } else if (error.message.includes("does not have bytecode")) {
      console.error("\n❌ Verification failed:");
      console.error("   Contract not found at the specified address");
      console.error("   Please check if the deployment was successful");
    } else if (error.message.includes("API key")) {
      console.error("\n❌ Verification failed:");
      console.error("   Invalid or missing Etherscan API key");
      console.error("   Please add ETHERSCAN_API_KEY to your .env file");
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);

      console.log("\n💡 Troubleshooting tips:");
      console.log("   1. Ensure your Etherscan API key is valid");
      console.log("   2. Wait a few moments after deployment before verifying");
      console.log("   3. Check that the constructor arguments are correct");
      console.log("   4. Verify the contract address is correct");
    }
  }

  console.log("\n==================================================");
  console.log("  Next Steps");
  console.log("==================================================");
  console.log("\n1. Interact with the verified contract:");
  console.log("   npm run interact");
  console.log("\n2. Run simulation tests:");
  console.log("   npm run simulate");
  console.log("\n==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
