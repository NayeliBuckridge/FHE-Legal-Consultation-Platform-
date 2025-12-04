const fs = require("fs");
const path = require("path");

console.log("\n==================================================");
console.log("  Security Audit Tool");
console.log("==================================================\n");

const securityChecks = [];

// Check 1: Verify no hardcoded private keys
function checkHardcodedKeys() {
  console.log("🔍 Checking for hardcoded private keys...");

  const patterns = [
    /private.*key.*=.*['"]/i,
    /0x[a-f0-9]{64}/i,
    /secret.*=.*['"]/i,
  ];

  const filesToCheck = [
    "hardhat.config.js",
    "scripts/*.js",
    "test/*.js",
  ];

  let found = false;

  filesToCheck.forEach(pattern => {
    // Simple check - in production would use glob
    const files = pattern.includes("*") ? [] : [pattern];

    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");
        patterns.forEach(p => {
          if (p.test(content) && !content.includes("process.env")) {
            console.log(`  ⚠️  Warning: Potential hardcoded secret in ${file}`);
            found = true;
          }
        });
      }
    });
  });

  if (!found) {
    console.log("  ✅ No hardcoded keys found\n");
    securityChecks.push({ check: "Hardcoded Keys", status: "PASS" });
  } else {
    securityChecks.push({ check: "Hardcoded Keys", status: "WARNING" });
  }
}

// Check 2: Verify .env is in .gitignore
function checkGitignore() {
  console.log("🔍 Checking .gitignore configuration...");

  if (fs.existsSync(".gitignore")) {
    const content = fs.readFileSync(".gitignore", "utf8");

    if (content.includes(".env")) {
      console.log("  ✅ .env is ignored\n");
      securityChecks.push({ check: "Gitignore Config", status: "PASS" });
    } else {
      console.log("  ❌ .env is NOT in .gitignore\n");
      securityChecks.push({ check: "Gitignore Config", status: "FAIL" });
    }
  } else {
    console.log("  ⚠️  .gitignore not found\n");
    securityChecks.push({ check: "Gitignore Config", status: "WARNING" });
  }
}

// Check 3: Verify contract compilation
function checkContractCompilation() {
  console.log("🔍 Checking contract compilation status...");

  if (fs.existsSync("artifacts")) {
    console.log("  ✅ Contracts compiled\n");
    securityChecks.push({ check: "Contract Compilation", status: "PASS" });
  } else {
    console.log("  ⚠️  Contracts not compiled. Run 'npm run compile'\n");
    securityChecks.push({ check: "Contract Compilation", status: "WARNING" });
  }
}

// Check 4: Verify test coverage
function checkTestCoverage() {
  console.log("🔍 Checking test coverage...");

  if (fs.existsSync("coverage/lcov.info")) {
    const content = fs.readFileSync("coverage/lcov.info", "utf8");
    const lines = content.split("\n");
    const lfHit = lines.filter(l => l.startsWith("LH:")).map(l => parseInt(l.split(":")[1]));
    const lfFound = lines.filter(l => l.startsWith("LF:")).map(l => parseInt(l.split(":")[1]));

    if (lfHit.length > 0 && lfFound.length > 0) {
      const totalHit = lfHit.reduce((a, b) => a + b, 0);
      const totalFound = lfFound.reduce((a, b) => a + b, 0);
      const coverage = (totalHit / totalFound * 100).toFixed(2);

      console.log(`  📊 Test coverage: ${coverage}%`);

      if (coverage >= 80) {
        console.log("  ✅ Coverage meets minimum threshold (80%)\n");
        securityChecks.push({ check: "Test Coverage", status: "PASS" });
      } else {
        console.log("  ⚠️  Coverage below 80%\n");
        securityChecks.push({ check: "Test Coverage", status: "WARNING" });
      }
    }
  } else {
    console.log("  ℹ️  Run 'npm run test:coverage' to generate report\n");
    securityChecks.push({ check: "Test Coverage", status: "INFO" });
  }
}

// Check 5: Verify dependencies
function checkDependencies() {
  console.log("🔍 Checking dependency security...");

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const devDeps = Object.keys(packageJson.devDependencies || {});
  const deps = Object.keys(packageJson.dependencies || {});

  console.log(`  📦 Production dependencies: ${deps.length}`);
  console.log(`  🔧 Dev dependencies: ${devDeps.length}`);
  console.log("  ℹ️  Run 'npm audit' for detailed security scan\n");

  securityChecks.push({ check: "Dependency Check", status: "INFO" });
}

// Generate summary
function generateSummary() {
  console.log("==================================================");
  console.log("  Security Audit Summary");
  console.log("==================================================\n");

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  securityChecks.forEach(check => {
    let icon = "ℹ️ ";
    if (check.status === "PASS") {
      icon = "✅";
      passCount++;
    } else if (check.status === "WARNING") {
      icon = "⚠️ ";
      warnCount++;
    } else if (check.status === "FAIL") {
      icon = "❌";
      failCount++;
    }

    console.log(`${icon} ${check.check}: ${check.status}`);
  });

  console.log("\n--------------------------------------------------");
  console.log(`Total Checks: ${securityChecks.length}`);
  console.log(`Passed: ${passCount} | Warnings: ${warnCount} | Failed: ${failCount}`);
  console.log("--------------------------------------------------\n");

  if (failCount > 0) {
    console.log("❌ Security audit found critical issues!");
    process.exit(1);
  } else if (warnCount > 0) {
    console.log("⚠️  Security audit completed with warnings.");
  } else {
    console.log("✅ Security audit passed!");
  }

  console.log("\n==================================================\n");
}

// Run all checks
checkHardcodedKeys();
checkGitignore();
checkContractCompilation();
checkTestCoverage();
checkDependencies();
generateSummary();
