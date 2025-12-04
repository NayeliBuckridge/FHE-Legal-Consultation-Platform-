const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n==================================================");
  console.log("  Futures Trading Simulation");
  console.log("==================================================\n");

  const network = hre.network.name;
  const [owner, trader1, trader2, trader3] = await hre.ethers.getSigners();

  console.log("Simulation Setup:");
  console.log("- Network:", network);
  console.log("- Owner:", owner.address);
  console.log("- Trader 1:", trader1.address);
  console.log("- Trader 2:", trader2.address);
  console.log("- Trader 3:", trader3.address);
  console.log("\n--------------------------------------------------\n");

  // Load or deploy contract
  let contractAddress;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deployment.contractAddress;
    console.log("📄 Using existing deployment");
    console.log("- Contract address:", contractAddress);
  } else {
    console.log("🚀 Deploying new contract for simulation...");
    const ConfidentialFuturesTrading = await hre.ethers.getContractFactory("ConfidentialFuturesTrading");
    const contract = await ConfidentialFuturesTrading.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed:", contractAddress);
  }

  const ConfidentialFuturesTrading = await hre.ethers.getContractFactory("ConfidentialFuturesTrading");
  const contract = ConfidentialFuturesTrading.attach(contractAddress);

  console.log("\n==================================================");
  console.log("  SCENARIO 1: Create Multiple Futures Contracts");
  console.log("==================================================\n");

  const assets = ["BTC", "ETH", "GOLD", "OIL"];
  const initialPrices = [50000, 3000, 2000, 80];
  const contractIds = [];

  for (let i = 0; i < assets.length; i++) {
    console.log(`📝 Creating ${assets[i]} futures contract...`);
    const tx = await contract.createFuturesContract(assets[i]);
    const receipt = await tx.wait();

    // Parse event to get contract ID
    const event = receipt.logs.find(log => {
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
      contractIds.push(contractId);
      console.log(`✅ ${assets[i]} contract created (ID: ${contractId})`);
    }

    // Set initial price
    console.log(`💰 Setting ${assets[i]} initial price: ${initialPrices[i]}`);
    const priceTx = await contract.setContractPrice(contractIds[i], initialPrices[i]);
    await priceTx.wait();
    console.log(`✅ Price set\n`);
  }

  console.log("==================================================");
  console.log("  SCENARIO 2: Multiple Traders Open Positions");
  console.log("==================================================\n");

  // Trader 1: Long BTC
  console.log("👤 Trader 1 - Opening LONG position on BTC");
  console.log("   Entry: 50200 | Amount: 100 | Collateral: 5000");
  const trader1Contract = contract.connect(trader1);
  let tx = await trader1Contract.openPosition(contractIds[0], 50200, 100, 5000, true);
  await tx.wait();
  console.log("   ✅ Position opened\n");

  // Trader 2: Short BTC
  console.log("👤 Trader 2 - Opening SHORT position on BTC");
  console.log("   Entry: 49800 | Amount: 150 | Collateral: 7500");
  const trader2Contract = contract.connect(trader2);
  tx = await trader2Contract.openPosition(contractIds[0], 49800, 150, 7500, false);
  await tx.wait();
  console.log("   ✅ Position opened\n");

  // Trader 3: Long ETH
  console.log("👤 Trader 3 - Opening LONG position on ETH");
  console.log("   Entry: 3050 | Amount: 200 | Collateral: 6000");
  const trader3Contract = contract.connect(trader3);
  tx = await trader3Contract.openPosition(contractIds[1], 3050, 200, 6000, true);
  await tx.wait();
  console.log("   ✅ Position opened\n");

  // Trader 1: Long GOLD
  console.log("👤 Trader 1 - Opening LONG position on GOLD");
  console.log("   Entry: 2020 | Amount: 50 | Collateral: 2000");
  tx = await trader1Contract.openPosition(contractIds[2], 2020, 50, 2000, true);
  await tx.wait();
  console.log("   ✅ Position opened\n");

  console.log("==================================================");
  console.log("  SCENARIO 3: Query Contract Statistics");
  console.log("==================================================\n");

  for (let i = 0; i < contractIds.length; i++) {
    const info = await contract.getContractInfo(contractIds[i]);
    console.log(`📊 ${assets[i]} Contract (ID: ${contractIds[i]})`);
    console.log(`   - Underlying: ${info.underlying}`);
    console.log(`   - Active traders: ${info.traderCount}`);
    console.log(`   - Price set: ${info.priceSet}`);
    console.log(`   - Settled: ${info.settled}`);
    console.log(`   - Active: ${await contract.isContractActive(contractIds[i])}`);
    console.log();
  }

  const activeCount = await contract.getActiveContractsCount();
  console.log(`📈 Total active contracts: ${activeCount}\n`);

  console.log("==================================================");
  console.log("  SCENARIO 4: Check Trader Positions");
  console.log("==================================================\n");

  // Check Trader 1 positions
  console.log("👤 Trader 1 Positions:");
  let pos1 = await contract.getTraderPositionStatus(contractIds[0], trader1.address);
  console.log(`   - BTC: ${pos1.hasPosition ? (pos1.isLong ? "LONG" : "SHORT") : "No position"}`);

  let pos2 = await contract.getTraderPositionStatus(contractIds[2], trader1.address);
  console.log(`   - GOLD: ${pos2.hasPosition ? (pos2.isLong ? "LONG" : "SHORT") : "No position"}`);
  console.log();

  // Check Trader 2 positions
  console.log("👤 Trader 2 Positions:");
  pos1 = await contract.getTraderPositionStatus(contractIds[0], trader2.address);
  console.log(`   - BTC: ${pos1.hasPosition ? (pos1.isLong ? "LONG" : "SHORT") : "No position"}`);
  console.log();

  // Check Trader 3 positions
  console.log("👤 Trader 3 Positions:");
  pos1 = await contract.getTraderPositionStatus(contractIds[1], trader3.address);
  console.log(`   - ETH: ${pos1.hasPosition ? (pos1.isLong ? "LONG" : "SHORT") : "No position"}`);
  console.log();

  console.log("==================================================");
  console.log("  SCENARIO 5: Settlement Time Analysis");
  console.log("==================================================\n");

  const timeToSettlement = await contract.getTimeToNextSettlement();
  const hours = Math.floor(Number(timeToSettlement) / 3600);
  const minutes = Math.floor((Number(timeToSettlement) % 3600) / 60);
  const seconds = Number(timeToSettlement) % 60;

  console.log("⏰ Settlement Information:");
  console.log(`   - Time to next settlement: ${hours}h ${minutes}m ${seconds}s`);
  console.log(`   - Can settle now: ${await contract.isSettlementTime()}`);
  console.log();

  console.log("==================================================");
  console.log("  SCENARIO 6: Time Travel (Local Network Only)");
  console.log("==================================================\n");

  if (network === "hardhat" || network === "localhost") {
    console.log("⏩ Fast-forwarding time by 4 hours...");
    await hre.network.provider.send("evm_increaseTime", [4 * 3600]);
    await hre.network.provider.send("evm_mine");

    const newTimeToSettlement = await contract.getTimeToNextSettlement();
    console.log(`✅ Time advanced`);
    console.log(`   - Can settle now: ${await contract.isSettlementTime()}`);
    console.log();
  } else {
    console.log("⚠️  Time travel only available on local networks");
    console.log("   Skipping this scenario\n");
  }

  console.log("==================================================");
  console.log("  SCENARIO 7: Settlement Simulation");
  console.log("==================================================\n");

  if (network === "hardhat" || network === "localhost") {
    console.log("💵 Settling BTC contract with final price: 51000");
    const settleTx = await contract.settleContract(contractIds[0], 51000);
    const settleReceipt = await settleTx.wait();
    console.log("✅ Settlement transaction submitted");
    console.log(`   - Gas used: ${settleReceipt.gasUsed}\n`);

    // Check if contract is settled
    const btcInfo = await contract.getContractInfo(contractIds[0]);
    console.log("📊 BTC Contract Status:");
    console.log(`   - Settled: ${btcInfo.settled}`);
    console.log();
  } else {
    console.log("⚠️  Settlement requires settlement time");
    console.log("   Use local network for full simulation\n");
  }

  console.log("==================================================");
  console.log("  Simulation Complete");
  console.log("==================================================\n");

  console.log("📊 Summary Statistics:");
  console.log(`   - Total contracts created: ${assets.length}`);
  console.log(`   - Total positions opened: 4`);
  console.log(`   - Active contracts: ${await contract.getActiveContractsCount()}`);
  console.log(`   - Unique traders: 3`);
  console.log();

  console.log("✅ All simulation scenarios completed!");
  console.log("\n💡 Key Features Demonstrated:");
  console.log("   ✓ Multi-asset futures contracts");
  console.log("   ✓ Long and short positions");
  console.log("   ✓ Encrypted position data");
  console.log("   ✓ Settlement mechanisms");
  console.log("   ✓ Position tracking");
  console.log("   ✓ Time-based settlements");
  console.log();

  if (network === "sepolia") {
    console.log("🔗 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log();
  }

  console.log("==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
