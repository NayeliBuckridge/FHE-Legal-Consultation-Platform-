const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n==================================================");
  console.log("  Contract Interaction Script");
  console.log("==================================================\n");

  const network = hre.network.name;
  const [owner, trader1, trader2] = await hre.ethers.getSigners();

  console.log("Interaction Information:");
  console.log("- Network:", network);
  console.log("- Owner address:", owner.address);
  console.log("- Trader 1 address:", trader1.address);
  console.log("- Trader 2 address:", trader2.address);
  console.log("\n--------------------------------------------------\n");

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  let contractAddress;

  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deployment.contractAddress;
    console.log("📄 Loaded contract from deployment file");
    console.log("- Contract address:", contractAddress);
  } else {
    console.error("❌ Deployment file not found");
    console.log("💡 Please deploy the contract first:");
    console.log("   npm run deploy");
    return;
  }

  // Get contract instance
  const ConfidentialFuturesTrading = await hre.ethers.getContractFactory("ConfidentialFuturesTrading");
  const contract = ConfidentialFuturesTrading.attach(contractAddress);

  console.log("\n==================================================");
  console.log("  1. Query Contract Owner");
  console.log("==================================================\n");

  try {
    const contractOwner = await contract.owner();
    console.log("✅ Contract owner:", contractOwner);
    console.log("- Is deployer:", contractOwner.toLowerCase() === owner.address.toLowerCase());
  } catch (error) {
    console.error("❌ Error querying owner:", error.message);
  }

  console.log("\n==================================================");
  console.log("  2. Create Futures Contract");
  console.log("==================================================\n");

  try {
    console.log("📝 Creating BTC futures contract...");
    const tx1 = await contract.createFuturesContract("BTC");
    const receipt1 = await tx1.wait();

    console.log("✅ BTC contract created");
    console.log("- Transaction hash:", tx1.hash);
    console.log("- Gas used:", receipt1.gasUsed.toString());

    // Extract contract ID from event
    const event = receipt1.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "ContractCreated";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      const contractId = parsedEvent.args.contractId;
      console.log("- Contract ID:", contractId.toString());

      console.log("\n📝 Creating ETH futures contract...");
      const tx2 = await contract.createFuturesContract("ETH");
      const receipt2 = await tx2.wait();

      console.log("✅ ETH contract created");
      console.log("- Transaction hash:", tx2.hash);
      console.log("- Gas used:", receipt2.gasUsed.toString());
    }
  } catch (error) {
    console.error("❌ Error creating contract:", error.message);
  }

  console.log("\n==================================================");
  console.log("  3. Set Initial Prices");
  console.log("==================================================\n");

  try {
    console.log("💰 Setting BTC price to 50000...");
    const tx3 = await contract.setContractPrice(1, 50000);
    await tx3.wait();
    console.log("✅ BTC price set");
    console.log("- Transaction hash:", tx3.hash);

    console.log("\n💰 Setting ETH price to 3000...");
    const tx4 = await contract.setContractPrice(2, 3000);
    await tx4.wait();
    console.log("✅ ETH price set");
    console.log("- Transaction hash:", tx4.hash);
  } catch (error) {
    console.error("❌ Error setting prices:", error.message);
  }

  console.log("\n==================================================");
  console.log("  4. Query Contract Information");
  console.log("==================================================\n");

  try {
    const btcInfo = await contract.getContractInfo(1);
    console.log("📊 BTC Contract (ID: 1):");
    console.log("- Price set:", btcInfo.priceSet);
    console.log("- Settled:", btcInfo.settled);
    console.log("- Underlying:", btcInfo.underlying);
    console.log("- Creation time:", new Date(Number(btcInfo.creationTime) * 1000).toLocaleString());
    console.log("- Expiry time:", new Date(Number(btcInfo.expiryTime) * 1000).toLocaleString());
    console.log("- Trader count:", btcInfo.traderCount.toString());

    const ethInfo = await contract.getContractInfo(2);
    console.log("\n📊 ETH Contract (ID: 2):");
    console.log("- Price set:", ethInfo.priceSet);
    console.log("- Settled:", ethInfo.settled);
    console.log("- Underlying:", ethInfo.underlying);
    console.log("- Creation time:", new Date(Number(ethInfo.creationTime) * 1000).toLocaleString());
    console.log("- Expiry time:", new Date(Number(ethInfo.expiryTime) * 1000).toLocaleString());
    console.log("- Trader count:", ethInfo.traderCount.toString());
  } catch (error) {
    console.error("❌ Error querying contract info:", error.message);
  }

  console.log("\n==================================================");
  console.log("  5. Check Active Contracts");
  console.log("==================================================\n");

  try {
    const activeCount = await contract.getActiveContractsCount();
    console.log("📈 Total active contracts:", activeCount.toString());

    const btcActive = await contract.isContractActive(1);
    console.log("- BTC contract active:", btcActive);

    const ethActive = await contract.isContractActive(2);
    console.log("- ETH contract active:", ethActive);
  } catch (error) {
    console.error("❌ Error checking active contracts:", error.message);
  }

  console.log("\n==================================================");
  console.log("  6. Check Settlement Time");
  console.log("==================================================\n");

  try {
    const timeToSettlement = await contract.getTimeToNextSettlement();
    const hours = Math.floor(Number(timeToSettlement) / 3600);
    const minutes = Math.floor((Number(timeToSettlement) % 3600) / 60);
    const seconds = Number(timeToSettlement) % 60;

    console.log("⏰ Time to next settlement:");
    console.log(`   ${hours}h ${minutes}m ${seconds}s`);

    const isSettlementTime = await contract.isSettlementTime();
    console.log("- Can settle now:", isSettlementTime);
  } catch (error) {
    console.error("❌ Error checking settlement time:", error.message);
  }

  console.log("\n==================================================");
  console.log("  7. Open Trading Position (Trader 1)");
  console.log("==================================================\n");

  try {
    console.log("🔓 Opening long position on BTC...");
    console.log("- Entry price: 50500");
    console.log("- Amount: 100");
    console.log("- Collateral: 5000");

    const traderContract = contract.connect(trader1);
    const tx5 = await traderContract.openPosition(
      1,      // contractId: BTC
      50500,  // entryPrice
      100,    // amount
      5000,   // collateral
      true    // isLong
    );
    const receipt5 = await tx5.wait();

    console.log("✅ Position opened");
    console.log("- Transaction hash:", tx5.hash);
    console.log("- Gas used:", receipt5.gasUsed.toString());
  } catch (error) {
    console.error("❌ Error opening position:", error.message);
  }

  console.log("\n==================================================");
  console.log("  8. Query Trader Position");
  console.log("==================================================\n");

  try {
    const positionStatus = await contract.getTraderPositionStatus(1, trader1.address);
    console.log("📊 Trader 1 position on BTC:");
    console.log("- Has position:", positionStatus.hasPosition);
    console.log("- Is long:", positionStatus.isLong);
    console.log("- Entry time:", new Date(Number(positionStatus.entryTime) * 1000).toLocaleString());

    // Check updated trader count
    const updatedInfo = await contract.getContractInfo(1);
    console.log("\n📈 Updated BTC contract:");
    console.log("- Trader count:", updatedInfo.traderCount.toString());
  } catch (error) {
    console.error("❌ Error querying position:", error.message);
  }

  console.log("\n==================================================");
  console.log("  Interaction Summary");
  console.log("==================================================");
  console.log("\n✅ All interactions completed successfully!");
  console.log("\n💡 Next steps:");
  console.log("   1. Run simulation to test settlement:");
  console.log("      npm run simulate");
  console.log("   2. View contract on Etherscan (Sepolia):");
  if (network === "sepolia") {
    console.log(`      https://sepolia.etherscan.io/address/${contractAddress}`);
  }
  console.log("\n==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction script failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
