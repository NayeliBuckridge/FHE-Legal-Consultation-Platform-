const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnonymousLegalConsultation", function () {
  let contract;
  let deployer, alice, bob, charlie, lawyer1, lawyer2, lawyer3;
  let contractAddress;

  const CONSULTATION_FEE = ethers.parseEther("0.001");
  const HIGHER_FEE = ethers.parseEther("0.005");

  const LEGAL_CATEGORIES = {
    CIVIL: 1,
    CRIMINAL: 2,
    FAMILY: 3,
    CORPORATE: 4,
    EMPLOYMENT: 5,
    REAL_ESTATE: 6,
    IMMIGRATION: 7,
    TAX: 8,
  };

  // Deployment fixture
  async function deployFixture() {
    const AnonymousLegalConsultation = await ethers.getContractFactory(
      "AnonymousLegalConsultation"
    );
    const instance = await AnonymousLegalConsultation.deploy();
    await instance.waitForDeployment();
    const address = await instance.getAddress();

    return { contract: instance, contractAddress: address };
  }

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    alice = signers[1];
    bob = signers[2];
    charlie = signers[3];
    lawyer1 = signers[4];
    lawyer2 = signers[5];
    lawyer3 = signers[6];
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  // ========================================
  // Deployment and Initialization Tests
  // ========================================
  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(await contract.getAddress()).to.equal(contractAddress);
    });

    it("should set the correct admin on deployment", async function () {
      expect(await contract.admin()).to.equal(deployer.address);
    });

    it("should initialize consultation counter to zero", async function () {
      expect(await contract.consultationCounter()).to.equal(0);
    });

    it("should initialize lawyer counter to zero", async function () {
      expect(await contract.lawyerCounter()).to.equal(0);
    });

    it("should initialize all 8 legal categories correctly", async function () {
      const categories = [
        "Civil Law",
        "Criminal Law",
        "Family Law",
        "Corporate Law",
        "Employment Law",
        "Real Estate Law",
        "Immigration Law",
        "Tax Law",
      ];

      for (let i = 1; i <= 8; i++) {
        expect(await contract.getLegalCategory(i)).to.equal(categories[i - 1]);
      }
    });

    it("should have zero balance initially", async function () {
      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(0);
    });

    it("should have correct contract bytecode", async function () {
      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.gt(2);
    });
  });

  // ========================================
  // Lawyer Registration Tests
  // ========================================
  describe("Lawyer Registration", function () {
    it("should allow lawyer to register with valid specialty", async function () {
      await expect(
        contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL)
      )
        .to.emit(contract, "LawyerRegistered")
        .withArgs(1, await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1));

      expect(await contract.lawyerCounter()).to.equal(1);
      expect(await contract.isRegisteredLawyer(lawyer1.address)).to.be.true;
    });

    it("should not allow duplicate lawyer registration", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);

      await expect(
        contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CRIMINAL)
      ).to.be.revertedWith("Already registered");
    });

    it("should reject specialty ID of 0", async function () {
      await expect(
        contract.connect(lawyer1).registerLawyer(0)
      ).to.be.revertedWith("Invalid specialty");
    });

    it("should reject specialty ID greater than 8", async function () {
      await expect(
        contract.connect(lawyer1).registerLawyer(9)
      ).to.be.revertedWith("Invalid specialty");

      await expect(
        contract.connect(lawyer1).registerLawyer(100)
      ).to.be.revertedWith("Invalid specialty");
    });

    it("should set lawyer as unverified initially", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      const profile = await contract.getLawyerProfile(1);
      expect(profile.isVerified).to.be.false;
    });

    it("should set lawyer as active initially", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      const profile = await contract.getLawyerProfile(1);
      expect(profile.isActive).to.be.true;
    });

    it("should assign correct lawyer ID sequentially", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      expect(await contract.getLawyerIdByAddress(lawyer1.address)).to.equal(1);

      await contract.connect(lawyer2).registerLawyer(LEGAL_CATEGORIES.CRIMINAL);
      expect(await contract.getLawyerIdByAddress(lawyer2.address)).to.equal(2);

      await contract.connect(lawyer3).registerLawyer(LEGAL_CATEGORIES.FAMILY);
      expect(await contract.getLawyerIdByAddress(lawyer3.address)).to.equal(3);
    });

    it("should initialize lawyer consultation count to zero", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      const profile = await contract.getLawyerProfile(1);
      expect(profile.consultationCount).to.equal(0);
    });

    it("should allow multiple lawyers with same specialty", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      await contract.connect(lawyer2).registerLawyer(LEGAL_CATEGORIES.CIVIL);

      expect(await contract.lawyerCounter()).to.equal(2);
    });

    it("should allow registration for all 8 specialties", async function () {
      const lawyers = await ethers.getSigners();

      for (let i = 1; i <= 8; i++) {
        await contract.connect(lawyers[i]).registerLawyer(i);
      }

      expect(await contract.lawyerCounter()).to.equal(8);
    });
  });

  // ========================================
  // Consultation Submission Tests
  // ========================================
  describe("Consultation Submission", function () {
    it("should allow client to submit consultation with minimum fee", async function () {
      const clientId = 10001;
      const question = "What are my rights in a contract dispute?";

      await expect(
        contract
          .connect(alice)
          .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
            value: CONSULTATION_FEE,
          })
      ).to.emit(contract, "ConsultationSubmitted");

      expect(await contract.consultationCounter()).to.equal(1);
    });

    it("should allow consultation with fee higher than minimum", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await contract
        .connect(alice)
        .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
          value: HIGHER_FEE,
        });

      const details = await contract.getConsultationDetails(1);
      expect(details.fee).to.equal(HIGHER_FEE);
    });

    it("should reject consultation with insufficient fee", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await expect(
        contract
          .connect(alice)
          .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
            value: ethers.parseEther("0.0005"),
          })
      ).to.be.revertedWith("Minimum consultation fee required");
    });

    it("should reject consultation with zero fee", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await expect(
        contract
          .connect(alice)
          .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
            value: 0,
          })
      ).to.be.revertedWith("Minimum consultation fee required");
    });

    it("should reject category ID of 0", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await expect(
        contract
          .connect(alice)
          .submitConsultation(clientId, 0, question, {
            value: CONSULTATION_FEE,
          })
      ).to.be.revertedWith("Invalid legal category");
    });

    it("should reject category ID greater than 8", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await expect(
        contract
          .connect(alice)
          .submitConsultation(clientId, 9, question, {
            value: CONSULTATION_FEE,
          })
      ).to.be.revertedWith("Invalid legal category");
    });

    it("should reject empty question string", async function () {
      const clientId = 10001;

      await expect(
        contract
          .connect(alice)
          .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, "", {
            value: CONSULTATION_FEE,
          })
      ).to.be.revertedWith("Question cannot be empty");
    });

    it("should accept long question strings", async function () {
      const clientId = 10001;
      const longQuestion = "A".repeat(1000); // 1000 characters

      await contract
        .connect(alice)
        .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, longQuestion, {
          value: CONSULTATION_FEE,
        });

      const details = await contract.getConsultationDetails(1);
      expect(details.encryptedQuestion).to.equal(longQuestion);
    });

    it("should update client statistics correctly", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await contract
        .connect(alice)
        .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
          value: CONSULTATION_FEE,
        });

      const stats = await contract.getClientStats(alice.address);
      expect(stats.totalConsultations).to.equal(1);
      expect(stats.totalSpent).to.equal(CONSULTATION_FEE);
    });

    it("should increase contract balance by consultation fee", async function () {
      const clientId = 10001;
      const question = "Legal question";

      const balanceBefore = await ethers.provider.getBalance(contractAddress);

      await contract
        .connect(alice)
        .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
          value: CONSULTATION_FEE,
        });

      const balanceAfter = await ethers.provider.getBalance(contractAddress);
      expect(balanceAfter - balanceBefore).to.equal(CONSULTATION_FEE);
    });

    it("should mark consultation as unresolved initially", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await contract
        .connect(alice)
        .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
          value: CONSULTATION_FEE,
        });

      const details = await contract.getConsultationDetails(1);
      expect(details.isResolved).to.be.false;
    });

    it("should mark consultation as paid", async function () {
      const clientId = 10001;
      const question = "Legal question";

      await contract
        .connect(alice)
        .submitConsultation(clientId, LEGAL_CATEGORIES.CIVIL, question, {
          value: CONSULTATION_FEE,
        });

      const details = await contract.getConsultationDetails(1);
      expect(details.isPaid).to.be.true;
    });

    it("should allow same client to submit multiple consultations", async function () {
      for (let i = 0; i < 3; i++) {
        await contract
          .connect(alice)
          .submitConsultation(10001 + i, LEGAL_CATEGORIES.CIVIL, `Question ${i}`, {
            value: CONSULTATION_FEE,
          });
      }

      const stats = await contract.getClientStats(alice.address);
      expect(stats.totalConsultations).to.equal(3);
      expect(stats.totalSpent).to.equal(CONSULTATION_FEE * 3n);
    });

    it("should track consultations from different clients separately", async function () {
      await contract
        .connect(alice)
        .submitConsultation(10001, LEGAL_CATEGORIES.CIVIL, "Question 1", {
          value: CONSULTATION_FEE,
        });

      await contract
        .connect(bob)
        .submitConsultation(10002, LEGAL_CATEGORIES.CRIMINAL, "Question 2", {
          value: HIGHER_FEE,
        });

      const aliceStats = await contract.getClientStats(alice.address);
      const bobStats = await contract.getClientStats(bob.address);

      expect(aliceStats.totalConsultations).to.equal(1);
      expect(aliceStats.totalSpent).to.equal(CONSULTATION_FEE);
      expect(bobStats.totalConsultations).to.equal(1);
      expect(bobStats.totalSpent).to.equal(HIGHER_FEE);
    });
  });

  // ========================================
  // Admin Functions Tests
  // ========================================
  describe("Admin Functions", function () {
    beforeEach(async function () {
      // Register lawyers
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      await contract.connect(lawyer2).registerLawyer(LEGAL_CATEGORIES.CRIMINAL);
      await contract.connect(lawyer3).registerLawyer(LEGAL_CATEGORIES.FAMILY);

      // Submit consultation
      await contract
        .connect(alice)
        .submitConsultation(10001, LEGAL_CATEGORIES.CIVIL, "Question", {
          value: CONSULTATION_FEE,
        });
    });

    it("should allow admin to verify lawyer", async function () {
      await expect(contract.connect(deployer).verifyLawyer(1))
        .to.emit(contract, "LawyerVerified")
        .withArgs(1);

      const profile = await contract.getLawyerProfile(1);
      expect(profile.isVerified).to.be.true;
    });

    it("should not allow non-admin to verify lawyer", async function () {
      await expect(
        contract.connect(alice).verifyLawyer(1)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("should reject verifying non-existent lawyer (ID 0)", async function () {
      await expect(
        contract.connect(deployer).verifyLawyer(0)
      ).to.be.revertedWith("Invalid lawyer ID");
    });

    it("should reject verifying lawyer with ID beyond counter", async function () {
      await expect(
        contract.connect(deployer).verifyLawyer(999)
      ).to.be.revertedWith("Invalid lawyer ID");
    });

    it("should allow admin to assign consultation to active lawyer", async function () {
      await expect(contract.connect(deployer).assignConsultation(1, 1))
        .to.emit(contract, "ConsultationAssigned")
        .withArgs(1, 1);
    });

    it("should not allow non-admin to assign consultation", async function () {
      await expect(
        contract.connect(alice).assignConsultation(1, 1)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("should not allow assigning to inactive lawyer", async function () {
      await contract.connect(deployer).deactivateLawyer(1);

      await expect(
        contract.connect(deployer).assignConsultation(1, 1)
      ).to.be.revertedWith("Lawyer not active");
    });

    it("should not allow assigning already resolved consultation", async function () {
      await contract.connect(deployer).assignConsultation(1, 1);
      await contract.connect(lawyer1).provideResponse(1, "Response");

      await expect(
        contract.connect(deployer).assignConsultation(1, 2)
      ).to.be.revertedWith("Consultation already resolved");
    });

    it("should allow admin to update lawyer rating", async function () {
      await contract.connect(deployer).updateLawyerRating(1, 85);
      // Rating is encrypted, cannot directly verify value
    });

    it("should reject rating above 100", async function () {
      await expect(
        contract.connect(deployer).updateLawyerRating(1, 101)
      ).to.be.revertedWith("Rating must be 0-100");
    });

    it("should accept rating of 0", async function () {
      await contract.connect(deployer).updateLawyerRating(1, 0);
    });

    it("should accept rating of 100", async function () {
      await contract.connect(deployer).updateLawyerRating(1, 100);
    });

    it("should allow admin to deactivate lawyer", async function () {
      await contract.connect(deployer).deactivateLawyer(1);

      const profile = await contract.getLawyerProfile(1);
      expect(profile.isActive).to.be.false;
    });

    it("should not allow non-admin to deactivate lawyer", async function () {
      await expect(
        contract.connect(alice).deactivateLawyer(1)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("should allow admin to withdraw fees", async function () {
      const contractBalance = await ethers.provider.getBalance(contractAddress);
      const initialBalance = await ethers.provider.getBalance(deployer.address);

      const tx = await contract.connect(deployer).withdrawFees(contractBalance);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(deployer.address);
      expect(finalBalance).to.be.closeTo(
        initialBalance + contractBalance - gasUsed,
        ethers.parseEther("0.0001")
      );
    });

    it("should not allow withdrawing more than contract balance", async function () {
      const contractBalance = await ethers.provider.getBalance(contractAddress);
      const excessAmount = contractBalance + ethers.parseEther("1");

      await expect(
        contract.connect(deployer).withdrawFees(excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("should not allow non-admin to withdraw fees", async function () {
      await expect(
        contract.connect(alice).withdrawFees(ethers.parseEther("0.001"))
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  // ========================================
  // Lawyer Response Tests
  // ========================================
  describe("Lawyer Response", function () {
    beforeEach(async function () {
      // Register and verify lawyer
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      await contract.connect(deployer).verifyLawyer(1);

      // Submit consultation
      await contract
        .connect(alice)
        .submitConsultation(10001, LEGAL_CATEGORIES.CIVIL, "Question", {
          value: CONSULTATION_FEE,
        });

      // Assign consultation
      await contract.connect(deployer).assignConsultation(1, 1);
    });

    it("should allow registered lawyer to provide response", async function () {
      const response = "Here is my legal advice...";

      await expect(
        contract.connect(lawyer1).provideResponse(1, response)
      ).to.emit(contract, "ResponseProvided");

      const details = await contract.getConsultationDetails(1);
      expect(details.isResolved).to.be.true;
      expect(details.encryptedResponse).to.equal(response);
    });

    it("should not allow non-lawyer to provide response", async function () {
      await expect(
        contract.connect(alice).provideResponse(1, "Response")
      ).to.be.revertedWith("Must be registered lawyer");
    });

    it("should not allow empty response", async function () {
      await expect(
        contract.connect(lawyer1).provideResponse(1, "")
      ).to.be.revertedWith("Response cannot be empty");
    });

    it("should not allow response to already resolved consultation", async function () {
      await contract.connect(lawyer1).provideResponse(1, "First response");

      await expect(
        contract.connect(lawyer1).provideResponse(1, "Second response")
      ).to.be.revertedWith("Consultation already resolved");
    });

    it("should update lawyer consultation count after providing response", async function () {
      await contract.connect(lawyer1).provideResponse(1, "Response");

      const profile = await contract.getLawyerProfile(1);
      expect(profile.consultationCount).to.equal(1);
    });

    it("should accept long response strings", async function () {
      const longResponse = "B".repeat(1000);

      await contract.connect(lawyer1).provideResponse(1, longResponse);

      const details = await contract.getConsultationDetails(1);
      expect(details.encryptedResponse).to.equal(longResponse);
    });
  });

  // ========================================
  // View Functions Tests
  // ========================================
  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      await contract
        .connect(alice)
        .submitConsultation(10001, LEGAL_CATEGORIES.CIVIL, "Question", {
          value: CONSULTATION_FEE,
        });
    });

    it("should return correct consultation details", async function () {
      const details = await contract.getConsultationDetails(1);

      expect(details.encryptedQuestion).to.equal("Question");
      expect(details.fee).to.equal(CONSULTATION_FEE);
      expect(details.isPaid).to.be.true;
      expect(details.isResolved).to.be.false;
    });

    it("should return correct lawyer profile", async function () {
      const profile = await contract.getLawyerProfile(1);

      expect(profile.consultationCount).to.equal(0);
      expect(profile.isVerified).to.be.false;
      expect(profile.isActive).to.be.true;
    });

    it("should return correct client stats", async function () {
      const stats = await contract.getClientStats(alice.address);

      expect(stats.totalConsultations).to.equal(1);
      expect(stats.totalSpent).to.equal(CONSULTATION_FEE);
    });

    it("should return correct system stats", async function () {
      const stats = await contract.getSystemStats();

      expect(stats.totalConsultations).to.equal(1);
      expect(stats.totalLawyers).to.equal(1);
      expect(stats.verifiedLawyers).to.equal(0);
    });

    it("should reject getting consultation with ID 0", async function () {
      await expect(contract.getConsultationDetails(0)).to.be.revertedWith(
        "Invalid consultation ID"
      );
    });

    it("should reject getting consultation beyond counter", async function () {
      await expect(contract.getConsultationDetails(999)).to.be.revertedWith(
        "Invalid consultation ID"
      );
    });

    it("should reject getting lawyer profile with ID 0", async function () {
      await expect(contract.getLawyerProfile(0)).to.be.revertedWith(
        "Invalid lawyer ID"
      );
    });

    it("should reject getting lawyer profile beyond counter", async function () {
      await expect(contract.getLawyerProfile(999)).to.be.revertedWith(
        "Invalid lawyer ID"
      );
    });

    it("should return zero stats for client with no consultations", async function () {
      const stats = await contract.getClientStats(charlie.address);

      expect(stats.totalConsultations).to.equal(0);
      expect(stats.totalSpent).to.equal(0);
    });
  });

  // ========================================
  // Complete Workflow Tests
  // ========================================
  describe("Complete Workflow", function () {
    it("should complete full consultation lifecycle", async function () {
      // 1. Register lawyers
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      await contract.connect(lawyer2).registerLawyer(LEGAL_CATEGORIES.CRIMINAL);

      // 2. Verify lawyers
      await contract.connect(deployer).verifyLawyer(1);
      await contract.connect(deployer).verifyLawyer(2);

      // 3. Submit consultations
      await contract
        .connect(alice)
        .submitConsultation(10001, LEGAL_CATEGORIES.CIVIL, "Civil question", {
          value: CONSULTATION_FEE,
        });

      await contract
        .connect(bob)
        .submitConsultation(10002, LEGAL_CATEGORIES.CRIMINAL, "Criminal question", {
          value: ethers.parseEther("0.002"),
        });

      // 4. Assign consultations
      await contract.connect(deployer).assignConsultation(1, 1);
      await contract.connect(deployer).assignConsultation(2, 2);

      // 5. Provide responses
      await contract.connect(lawyer1).provideResponse(1, "Civil advice");
      await contract.connect(lawyer2).provideResponse(2, "Criminal advice");

      // 6. Verify final state
      const stats = await contract.getSystemStats();
      expect(stats.totalConsultations).to.equal(2);
      expect(stats.totalLawyers).to.equal(2);
      expect(stats.verifiedLawyers).to.equal(2);

      const consultation1 = await contract.getConsultationDetails(1);
      expect(consultation1.isResolved).to.be.true;

      const lawyer1Profile = await contract.getLawyerProfile(1);
      expect(lawyer1Profile.consultationCount).to.equal(1);
    });
  });

  // ========================================
  // Edge Cases and Boundary Tests
  // ========================================
  describe("Edge Cases", function () {
    it("should handle multiple consultations from same client", async function () {
      for (let i = 0; i < 5; i++) {
        await contract
          .connect(alice)
          .submitConsultation(10001, LEGAL_CATEGORIES.CIVIL, `Question ${i}`, {
            value: CONSULTATION_FEE,
          });
      }

      const stats = await contract.getClientStats(alice.address);
      expect(stats.totalConsultations).to.equal(5);
      expect(stats.totalSpent).to.equal(CONSULTATION_FEE * 5n);
    });

    it("should handle all 8 legal categories", async function () {
      for (let i = 1; i <= 8; i++) {
        const category = await contract.getLegalCategory(i);
        expect(category).to.not.equal("");
        expect(category.length).to.be.gt(0);
      }
    });

    it("should return correct stats with multiple verified lawyers", async function () {
      await contract.connect(lawyer1).registerLawyer(LEGAL_CATEGORIES.CIVIL);
      await contract.connect(lawyer2).registerLawyer(LEGAL_CATEGORIES.CRIMINAL);
      await contract.connect(lawyer3).registerLawyer(LEGAL_CATEGORIES.FAMILY);

      await contract.connect(deployer).verifyLawyer(1);
      await contract.connect(deployer).verifyLawyer(3);

      const stats = await contract.getSystemStats();
      expect(stats.totalLawyers).to.equal(3);
      expect(stats.verifiedLawyers).to.equal(2);
    });

    it("should handle consultation with maximum uint32 client ID", async function () {
      const maxClientId = 2**32 - 1;

      await contract
        .connect(alice)
        .submitConsultation(maxClientId, LEGAL_CATEGORIES.CIVIL, "Question", {
          value: CONSULTATION_FEE,
        });

      expect(await contract.consultationCounter()).to.equal(1);
    });

    it("should maintain state consistency across multiple operations", async function () {
      // Register 3 lawyers
      await contract.connect(lawyer1).registerLawyer(1);
      await contract.connect(lawyer2).registerLawyer(2);
      await contract.connect(lawyer3).registerLawyer(3);

      // Submit 3 consultations
      await contract.connect(alice).submitConsultation(1, 1, "Q1", { value: CONSULTATION_FEE });
      await contract.connect(bob).submitConsultation(2, 2, "Q2", { value: CONSULTATION_FEE });
      await contract.connect(charlie).submitConsultation(3, 3, "Q3", { value: CONSULTATION_FEE });

      expect(await contract.lawyerCounter()).to.equal(3);
      expect(await contract.consultationCounter()).to.equal(3);
    });
  });

  // ========================================
  // Gas Optimization Tests
  // ========================================
  describe("Gas Optimization", function () {
    it("should deploy within reasonable gas limits", async function () {
      const AnonymousLegalConsultation = await ethers.getContractFactory(
        "AnonymousLegalConsultation"
      );
      const instance = await AnonymousLegalConsultation.deploy();
      const receipt = await instance.deploymentTransaction().wait();

      expect(receipt.gasUsed).to.be.lt(3000000); // < 3M gas
    });

    it("should submit consultation within reasonable gas limits", async function () {
      const tx = await contract
        .connect(alice)
        .submitConsultation(10001, 1, "Question", {
          value: CONSULTATION_FEE,
        });
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000); // < 300k gas
    });

    it("should register lawyer within reasonable gas limits", async function () {
      const tx = await contract.connect(lawyer1).registerLawyer(1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000); // < 200k gas
    });
  });
});
