const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Simulate complete workflow for AnonymousLegalConsultation
 *
 * This script simulates a complete legal consultation workflow:
 * 1. Deploy contract
 * 2. Register lawyers
 * 3. Submit consultations
 * 4. Assign consultations
 * 5. Provide responses
 */

// Legal categories
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

// Sample consultation data
const SAMPLE_CONSULTATIONS = [
  {
    clientId: 10001,
    categoryId: 1,
    question:
      "I need advice about a contract dispute with my landlord regarding early termination.",
    fee: "0.002",
  },
  {
    clientId: 10002,
    categoryId: 3,
    question:
      "What are my rights in a divorce proceeding with shared property?",
    fee: "0.003",
  },
  {
    clientId: 10003,
    categoryId: 5,
    question:
      "My employer terminated my contract without notice. What are my options?",
    fee: "0.0015",
  },
  {
    clientId: 10004,
    categoryId: 4,
    question: "I need guidance on incorporating a startup and equity distribution.",
    fee: "0.005",
  },
  {
    clientId: 10005,
    categoryId: 2,
    question: "I was charged with a misdemeanor. What should I expect in court?",
    fee: "0.004",
  },
];

// Sample lawyer data
const SAMPLE_LAWYERS = [
  { specialty: 1, name: "Civil Law Specialist" },
  { specialty: 2, name: "Criminal Defense Attorney" },
  { specialty: 3, name: "Family Law Expert" },
  { specialty: 4, name: "Corporate Lawyer" },
  { specialty: 5, name: "Employment Law Attorney" },
];

/**
 * Helper function to wait
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load or deploy contract
 */
async function getContract() {
  const network = hre.network.name;
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentPath = path.join(
    deploymentsDir,
    `${network}-deployment.json`
  );

  let contract, contractAddress;

  // Check if contract is already deployed
  if (fs.existsSync(deploymentPath)) {
    console.log("📋 Loading existing deployment...");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    contract = await hre.ethers.getContractAt(
      "AnonymousLegalConsultation",
      contractAddress
    );
    console.log(`✅ Contract loaded: ${contractAddress}\n`);
  } else {
    console.log("🚀 No existing deployment found. Deploying new contract...\n");
    const AnonymousLegalConsultation = await hre.ethers.getContractFactory(
      "AnonymousLegalConsultation"
    );
    contract = await AnonymousLegalConsultation.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed: ${contractAddress}\n`);

    // Save deployment info
    const [deployer] = await hre.ethers.getSigners();
    const deploymentInfo = {
      network: network,
      contractName: "AnonymousLegalConsultation",
      contractAddress: contractAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
    };

    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  }

  return { contract, contractAddress };
}

/**
 * Display simulation header
 */
function displayHeader(title) {
  console.log("\n" + "═".repeat(70));
  console.log(`  ${title}`);
  console.log("═".repeat(70) + "\n");
}

/**
 * Main simulation
 */
async function main() {
  displayHeader("🎭 LEGAL CONSULTATION PLATFORM SIMULATION");

  const [admin, client1, client2, lawyer1, lawyer2, lawyer3] =
    await hre.ethers.getSigners();

  console.log("👥 Simulation Accounts:");
  console.log("─".repeat(70));
  console.log(`Admin:   ${admin.address}`);
  console.log(`Client1: ${client1.address}`);
  console.log(`Client2: ${client2.address}`);
  console.log(`Lawyer1: ${lawyer1.address}`);
  console.log(`Lawyer2: ${lawyer2.address}`);
  console.log(`Lawyer3: ${lawyer3.address}`);
  console.log("─".repeat(70));

  // Get contract
  const { contract, contractAddress } = await getContract();

  // Phase 1: Register Lawyers
  displayHeader("⚖️  PHASE 1: LAWYER REGISTRATION");

  const lawyers = [lawyer1, lawyer2, lawyer3];
  const lawyerIds = [];

  for (let i = 0; i < 3; i++) {
    console.log(`${i + 1}. Registering ${SAMPLE_LAWYERS[i].name}...`);
    try {
      const tx = await contract
        .connect(lawyers[i])
        .registerLawyer(SAMPLE_LAWYERS[i].specialty);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "LawyerRegistered"
      );
      if (event) {
        lawyerIds.push(Number(event.args[0]));
        console.log(
          `   ✅ Registered - Lawyer ID: ${event.args[0]} (Specialty: ${
            LEGAL_CATEGORIES[SAMPLE_LAWYERS[i].specialty]
          })`
        );
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    await wait(1000);
  }

  // Phase 2: Verify Lawyers (Admin action)
  displayHeader("✅ PHASE 2: LAWYER VERIFICATION");

  for (const lawyerId of lawyerIds) {
    console.log(`${lawyerId}. Verifying Lawyer ID ${lawyerId}...`);
    try {
      const tx = await contract.connect(admin).verifyLawyer(lawyerId);
      await tx.wait();
      console.log(`   ✅ Lawyer ${lawyerId} verified`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    await wait(500);
  }

  // Phase 3: Submit Consultations
  displayHeader("📝 PHASE 3: CLIENT CONSULTATIONS");

  const clients = [client1, client1, client2, client2, client1];
  const consultationIds = [];

  for (let i = 0; i < SAMPLE_CONSULTATIONS.length; i++) {
    const consultation = SAMPLE_CONSULTATIONS[i];
    console.log(`${i + 1}. Submitting consultation in ${LEGAL_CATEGORIES[consultation.categoryId]}...`);
    console.log(`   Question: "${consultation.question}"`);

    try {
      const tx = await contract
        .connect(clients[i])
        .submitConsultation(
          consultation.clientId,
          consultation.categoryId,
          consultation.question,
          {
            value: hre.ethers.parseEther(consultation.fee),
          }
        );
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ConsultationSubmitted"
      );
      if (event) {
        consultationIds.push(Number(event.args[0]));
        console.log(
          `   ✅ Submitted - Consultation ID: ${event.args[0]} (Fee: ${consultation.fee} ETH)`
        );
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    await wait(1000);
  }

  // Phase 4: Assign Consultations
  displayHeader("🔗 PHASE 4: CONSULTATION ASSIGNMENT");

  for (let i = 0; i < consultationIds.length; i++) {
    const consultationId = consultationIds[i];
    const lawyerId = lawyerIds[i % lawyerIds.length]; // Round-robin assignment

    console.log(`${i + 1}. Assigning Consultation ${consultationId} to Lawyer ${lawyerId}...`);

    try {
      const tx = await contract
        .connect(admin)
        .assignConsultation(consultationId, lawyerId);
      await tx.wait();
      console.log(`   ✅ Assigned successfully`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    await wait(500);
  }

  // Phase 5: Provide Responses
  displayHeader("💬 PHASE 5: LAWYER RESPONSES");

  const responses = [
    "Based on your rental agreement, you may have grounds to negotiate early termination. Review the termination clause carefully.",
    "In divorce proceedings with shared property, assets are typically divided equitably. Consult with a local attorney for specific state laws.",
    "Termination without notice may violate labor laws. Document everything and consider filing a complaint with the labor board.",
    "For startup incorporation, consider an LLC or C-Corp structure. Equity distribution should be formalized in a shareholders agreement.",
    "For misdemeanor charges, you have the right to legal representation. Consider consulting a criminal defense attorney immediately.",
  ];

  for (let i = 0; i < consultationIds.length; i++) {
    const consultationId = consultationIds[i];
    const lawyerIndex = i % lawyers.length;

    console.log(`${i + 1}. Lawyer ${lawyerIds[lawyerIndex]} responding to Consultation ${consultationId}...`);

    try {
      const tx = await contract
        .connect(lawyers[lawyerIndex])
        .provideResponse(consultationId, responses[i]);
      await tx.wait();
      console.log(`   ✅ Response provided`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    await wait(1000);
  }

  // Phase 6: Display Final Statistics
  displayHeader("📊 FINAL STATISTICS");

  const stats = await contract.getSystemStats();

  console.log("Platform Statistics:");
  console.log("─".repeat(70));
  console.log(`Total Consultations:  ${stats[0]}`);
  console.log(`Total Lawyers:        ${stats[1]}`);
  console.log(`Verified Lawyers:     ${stats[2]}`);
  console.log(`Contract Balance:     ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(contractAddress))} ETH`);
  console.log("─".repeat(70));

  console.log("\n📋 Consultation Details:");
  console.log("─".repeat(70));

  for (const consultationId of consultationIds) {
    try {
      const details = await contract.getConsultationDetails(consultationId);
      console.log(`\nConsultation #${consultationId}:`);
      console.log(`  Status: ${details[4] ? "Resolved ✅" : "Pending ⏳"}`);
      console.log(`  Fee: ${hre.ethers.formatEther(details[3])} ETH`);
      console.log(`  Timestamp: ${new Date(Number(details[2]) * 1000).toLocaleString()}`);
    } catch (error) {
      console.log(`  Error retrieving consultation ${consultationId}`);
    }
  }

  console.log("\n" + "─".repeat(70));

  console.log("\n📋 Lawyer Profiles:");
  console.log("─".repeat(70));

  for (const lawyerId of lawyerIds) {
    try {
      const profile = await contract.getLawyerProfile(lawyerId);
      console.log(`\nLawyer #${lawyerId}:`);
      console.log(`  Consultations Handled: ${profile[0]}`);
      console.log(`  Verified: ${profile[1] ? "Yes ✅" : "No ❌"}`);
      console.log(`  Active: ${profile[2] ? "Yes ✅" : "No ❌"}`);
    } catch (error) {
      console.log(`  Error retrieving lawyer ${lawyerId}`);
    }
  }

  console.log("\n" + "─".repeat(70));

  displayHeader("✨ SIMULATION COMPLETED SUCCESSFULLY");

  console.log("📝 Summary:");
  console.log(`   • ${lawyerIds.length} lawyers registered and verified`);
  console.log(`   • ${consultationIds.length} consultations submitted`);
  console.log(`   • ${consultationIds.length} consultations assigned and resolved`);
  console.log(`   • Contract Address: ${contractAddress}`);
  console.log("");
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
