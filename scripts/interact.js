const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Interactive script for AnonymousLegalConsultation Contract
 *
 * This script provides an interactive CLI to interact with
 * the deployed contract's functions.
 */

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Legal categories mapping
const LEGAL_CATEGORIES = {
  1: "Civil Law",
  2: "Criminal Law",
  3: "Family Law",
  4: "Corporate Law",
  5: "Employment Law",
  6: "Real Estate Law",
  7: "Immigration Law",
  8: "Tax Law",
};

/**
 * Load deployed contract
 */
async function loadContract() {
  const network = hre.network.name;
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentPath = path.join(
    deploymentsDir,
    `${network}-deployment.json`
  );

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      `❌ Deployment file not found for network: ${network}\n` +
        `   Please deploy the contract first using:\n` +
        `   npx hardhat run scripts/deploy.js --network ${network}`
    );
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  const contract = await hre.ethers.getContractAt(
    "AnonymousLegalConsultation",
    contractAddress
  );

  return { contract, contractAddress, network };
}

/**
 * Display contract information
 */
async function displayContractInfo(contract, contractAddress, network) {
  console.log("\n📋 Contract Information:");
  console.log("─".repeat(60));
  console.log(`Network:          ${network}`);
  console.log(`Contract Address: ${contractAddress}`);

  const admin = await contract.admin();
  const stats = await contract.getSystemStats();

  console.log(`Admin:            ${admin}`);
  console.log(`Total Consultations: ${stats[0]}`);
  console.log(`Total Lawyers:       ${stats[1]}`);
  console.log(`Verified Lawyers:    ${stats[2]}`);
  console.log("─".repeat(60));
}

/**
 * Display menu options
 */
function displayMenu() {
  console.log("\n🔧 Available Actions:");
  console.log("─".repeat(60));
  console.log("1.  Submit Consultation (Client)");
  console.log("2.  Register as Lawyer");
  console.log("3.  Get Consultation Details");
  console.log("4.  Get Lawyer Profile");
  console.log("5.  Get Client Statistics");
  console.log("6.  View Legal Categories");
  console.log("7.  Check Lawyer Registration Status");
  console.log("8.  Get System Statistics");
  console.log("");
  console.log("Admin Functions:");
  console.log("9.  Assign Consultation to Lawyer");
  console.log("10. Verify Lawyer");
  console.log("11. Update Lawyer Rating");
  console.log("12. Deactivate Lawyer");
  console.log("13. Withdraw Fees");
  console.log("");
  console.log("0.  Exit");
  console.log("─".repeat(60));
}

/**
 * Submit consultation
 */
async function submitConsultation(contract, signer) {
  console.log("\n📝 Submit Legal Consultation");
  console.log("─".repeat(60));

  // Display categories
  console.log("Legal Categories:");
  for (const [id, name] of Object.entries(LEGAL_CATEGORIES)) {
    console.log(`  ${id}. ${name}`);
  }

  const clientId = await question("\nEnter Client ID (anonymous): ");
  const categoryId = await question("Select Legal Category (1-8): ");
  const question_text = await question("Enter Encrypted Question: ");
  const fee = await question("Enter Consultation Fee (ETH, min 0.001): ");

  console.log("\n⏳ Submitting consultation...");

  try {
    const tx = await contract
      .connect(signer)
      .submitConsultation(clientId, categoryId, question_text, {
        value: hre.ethers.parseEther(fee),
      });

    console.log(`Transaction Hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log(`✅ Consultation submitted! (Block: ${receipt.blockNumber})`);

    // Get consultation ID from event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "ConsultationSubmitted"
    );
    if (event) {
      console.log(`📋 Consultation ID: ${event.args[0]}`);
    }
  } catch (error) {
    console.error("❌ Error submitting consultation:", error.message);
  }
}

/**
 * Register as lawyer
 */
async function registerLawyer(contract, signer) {
  console.log("\n⚖️  Register as Lawyer");
  console.log("─".repeat(60));

  // Display specialties
  console.log("Legal Specialties:");
  for (const [id, name] of Object.entries(LEGAL_CATEGORIES)) {
    console.log(`  ${id}. ${name}`);
  }

  const specialty = await question("\nSelect Your Specialty (1-8): ");

  console.log("\n⏳ Registering lawyer...");

  try {
    const tx = await contract.connect(signer).registerLawyer(specialty);
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log(`✅ Lawyer registered! (Block: ${receipt.blockNumber})`);

    // Get lawyer ID from event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "LawyerRegistered"
    );
    if (event) {
      console.log(`👨‍⚖️ Lawyer ID: ${event.args[0]}`);
    }
  } catch (error) {
    console.error("❌ Error registering lawyer:", error.message);
  }
}

/**
 * Get consultation details
 */
async function getConsultationDetails(contract) {
  console.log("\n📄 Get Consultation Details");
  console.log("─".repeat(60));

  const consultationId = await question("Enter Consultation ID: ");

  try {
    const details = await contract.getConsultationDetails(consultationId);

    console.log("\n📋 Consultation Details:");
    console.log("─".repeat(60));
    console.log(`Encrypted Question: ${details[0]}`);
    console.log(`Encrypted Response: ${details[1] || "Not yet answered"}`);
    console.log(`Timestamp:          ${new Date(Number(details[2]) * 1000).toLocaleString()}`);
    console.log(`Fee:                ${hre.ethers.formatEther(details[3])} ETH`);
    console.log(`Resolved:           ${details[4] ? "Yes" : "No"}`);
    console.log(`Paid:               ${details[5] ? "Yes" : "No"}`);
    console.log("─".repeat(60));
  } catch (error) {
    console.error("❌ Error getting consultation:", error.message);
  }
}

/**
 * Get lawyer profile
 */
async function getLawyerProfile(contract) {
  console.log("\n👨‍⚖️ Get Lawyer Profile");
  console.log("─".repeat(60));

  const lawyerId = await question("Enter Lawyer ID: ");

  try {
    const profile = await contract.getLawyerProfile(lawyerId);

    console.log("\n📋 Lawyer Profile:");
    console.log("─".repeat(60));
    console.log(`Consultation Count: ${profile[0]}`);
    console.log(`Verified:           ${profile[1] ? "Yes ✅" : "No ❌"}`);
    console.log(`Active:             ${profile[2] ? "Yes ✅" : "No ❌"}`);
    console.log("─".repeat(60));
  } catch (error) {
    console.error("❌ Error getting lawyer profile:", error.message);
  }
}

/**
 * Get client statistics
 */
async function getClientStats(contract) {
  console.log("\n📊 Get Client Statistics");
  console.log("─".repeat(60));

  const clientAddress = await question("Enter Client Address: ");

  try {
    const stats = await contract.getClientStats(clientAddress);

    console.log("\n📋 Client Statistics:");
    console.log("─".repeat(60));
    console.log(`Total Consultations: ${stats[0]}`);
    console.log(`Total Spent:         ${hre.ethers.formatEther(stats[1])} ETH`);
    console.log("─".repeat(60));
  } catch (error) {
    console.error("❌ Error getting client stats:", error.message);
  }
}

/**
 * View legal categories
 */
async function viewLegalCategories(contract) {
  console.log("\n📚 Legal Categories");
  console.log("─".repeat(60));

  for (let i = 1; i <= 8; i++) {
    try {
      const category = await contract.getLegalCategory(i);
      console.log(`${i}. ${category}`);
    } catch (error) {
      console.error(`Error getting category ${i}:`, error.message);
    }
  }

  console.log("─".repeat(60));
}

/**
 * Main interaction loop
 */
async function main() {
  console.log("🚀 AnonymousLegalConsultation Interactive CLI\n");

  try {
    const { contract, contractAddress, network } = await loadContract();
    const [signer] = await hre.ethers.getSigners();

    console.log(`Connected Account: ${signer.address}`);
    await displayContractInfo(contract, contractAddress, network);

    let running = true;

    while (running) {
      displayMenu();
      const choice = await question("\nSelect an action: ");

      switch (choice) {
        case "1":
          await submitConsultation(contract, signer);
          break;
        case "2":
          await registerLawyer(contract, signer);
          break;
        case "3":
          await getConsultationDetails(contract);
          break;
        case "4":
          await getLawyerProfile(contract);
          break;
        case "5":
          await getClientStats(contract);
          break;
        case "6":
          await viewLegalCategories(contract);
          break;
        case "8":
          await displayContractInfo(contract, contractAddress, network);
          break;
        case "0":
          running = false;
          console.log("\n👋 Goodbye!");
          break;
        default:
          console.log("❌ Invalid choice. Please try again.");
      }
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

// Execute interactive CLI
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
