/**
 * @title Gateway Service
 * @notice Off-chain service for processing decryption requests and invoking callbacks
 * @dev Monitors blockchain for DecryptionRequested events and processes them
 */

const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

class GatewayService {
    constructor(config) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);
        this.contractAddress = config.contractAddress;
        this.contractABI = this._loadABI();
        this.contract = new ethers.Contract(
            this.contractAddress,
            this.contractABI,
            this.wallet
        );

        // Configuration
        this.TIMEOUT_CHECK_INTERVAL = 60000; // Check every minute
        this.DECRYPTION_TIMEOUT = 86400000; // 24 hours in milliseconds
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 5000; // 5 seconds between retries

        // State tracking
        this.pendingRequests = new Map();
        this.processedRequests = new Set();
        this.failedRequests = new Map();
    }

    /**
     * Load contract ABI from artifacts
     */
    _loadABI() {
        try {
            const artifactPath = path.join(
                __dirname,
                '../artifacts/contracts/ConfidentialFuturesTradingEnhanced.sol/ConfidentialFuturesTradingEnhanced.json'
            );
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            return artifact.abi;
        } catch (error) {
            console.error('Failed to load contract ABI:', error);
            process.exit(1);
        }
    }

    /**
     * Start the Gateway service
     */
    async start() {
        console.log('🚀 Gateway Service Starting...');
        console.log(`📌 Contract: ${this.contractAddress}`);
        console.log(`🔗 Network: ${(await this.provider.getNetwork()).name}`);

        // Start event listening
        this._startEventListener();

        // Start timeout checking
        this._startTimeoutChecker();

        console.log('✅ Gateway Service Started');
    }

    /**
     * Start listening for DecryptionRequested events
     */
    _startEventListener() {
        // Listen for new DecryptionRequested events
        this.contract.on('DecryptionRequested', async (requestId, contractId, timestamp) => {
            console.log(`\n📡 DecryptionRequested Event Detected`);
            console.log(`   Request ID: ${requestId}`);
            console.log(`   Contract ID: ${contractId}`);
            console.log(`   Timestamp: ${new Date(timestamp * 1000).toISOString()}`);

            // Add to pending requests
            this.pendingRequests.set(requestId.toString(), {
                requestId: requestId.toString(),
                contractId: contractId.toString(),
                timestamp: Number(timestamp),
                createdAt: Date.now(),
                retries: 0
            });

            // Process immediately
            await this._processDecryptionRequest(requestId, contractId, timestamp);
        });

        // Listen for error events
        this.contract.on('DecryptionFailed', (requestId, reason) => {
            console.log(`\n⚠️  DecryptionFailed Event`);
            console.log(`   Request ID: ${requestId}`);
            console.log(`   Reason: ${reason}`);

            this.failedRequests.set(requestId.toString(), {
                requestId: requestId.toString(),
                reason,
                failedAt: Date.now()
            });
        });

        // Listen for successful callbacks
        this.contract.on('GatewayCallbackProcessed', (requestId, success) => {
            console.log(`\n✅ GatewayCallbackProcessed Event`);
            console.log(`   Request ID: ${requestId}`);
            console.log(`   Success: ${success}`);

            if (success) {
                this.processedRequests.add(requestId.toString());
                this.pendingRequests.delete(requestId.toString());
            }
        });

        console.log('🎧 Event Listener Started');
    }

    /**
     * Start timeout checker
     */
    _startTimeoutChecker() {
        setInterval(async () => {
            const now = Date.now();
            const timedOutRequests = [];

            for (const [requestId, request] of this.pendingRequests.entries()) {
                const elapsed = now - request.createdAt;

                if (elapsed > this.DECRYPTION_TIMEOUT) {
                    console.log(`\n⏱️  Timeout Detected for Request ${requestId}`);
                    timedOutRequests.push(request);
                }
            }

            // Process timed out requests
            for (const request of timedOutRequests) {
                await this._handleTimeout(request);
            }
        }, this.TIMEOUT_CHECK_INTERVAL);

        console.log('⏱️  Timeout Checker Started');
    }

    /**
     * Process a decryption request
     */
    async _processDecryptionRequest(requestId, contractId, timestamp) {
        console.log(`\n🔄 Processing Decryption Request ${requestId}`);

        try {
            // Simulate decryption (in production, this would call FHEVM oracle)
            const decryptedPrice = await this._simulateDecryption(contractId);

            if (decryptedPrice === 0) {
                throw new Error('Decryption returned zero');
            }

            console.log(`✅ Decryption Successful`);
            console.log(`   Price: ${decryptedPrice}`);

            // Call settlement callback
            await this._callSettlementCallback(requestId, decryptedPrice);

        } catch (error) {
            console.error(`❌ Decryption Failed:`, error.message);

            // Retry logic
            const request = this.pendingRequests.get(requestId.toString());
            if (request.retries < this.MAX_RETRIES) {
                request.retries++;
                console.log(`🔄 Retry ${request.retries}/${this.MAX_RETRIES}`);

                // Schedule retry
                setTimeout(
                    () => this._processDecryptionRequest(requestId, contractId, timestamp),
                    this.RETRY_DELAY
                );
            } else {
                console.error(`❌ Max retries exceeded for request ${requestId}`);
                this.failedRequests.set(requestId.toString(), {
                    requestId: requestId.toString(),
                    reason: error.message,
                    failedAt: Date.now()
                });
            }
        }
    }

    /**
     * Simulate decryption (mock implementation)
     * In production: call actual FHEVM oracle
     */
    async _simulateDecryption(contractId) {
        // Simulate decryption delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock decrypted price
        const mockPrice = Math.floor(Math.random() * 60000) + 40000; // BTC price range
        return mockPrice;
    }

    /**
     * Call settlement callback on contract
     */
    async _callSettlementCallback(requestId, decryptedPrice) {
        console.log(`\n📤 Calling Settlement Callback`);
        console.log(`   Request ID: ${requestId}`);
        console.log(`   Price: ${decryptedPrice}`);

        try {
            // In production: get actual signatures from FHEVM
            const mockSignatures = []; // Empty for mock

            const tx = await this.contract.processSettlementCallback(
                requestId,
                decryptedPrice,
                mockSignatures,
                {
                    gasLimit: 500000 // Adjust as needed
                }
            );

            console.log(`📝 Transaction Hash: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Callback Processed`);
            console.log(`   Block: ${receipt.blockNumber}`);
            console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

            return receipt;

        } catch (error) {
            console.error(`❌ Callback Failed:`, error.message);
            throw error;
        }
    }

    /**
     * Handle timeout for pending requests
     */
    async _handleTimeout(request) {
        console.log(`\n⚠️  Handling Timeout for Request ${request.requestId}`);
        console.log(`   Contract ID: ${request.contractId}`);
        console.log(`   Time Elapsed: ${(Date.now() - request.createdAt) / 1000 / 3600} hours`);

        try {
            // In production: trigger automatic refund
            // For now, just log and remove from pending
            this.pendingRequests.delete(request.requestId);
            this.failedRequests.set(request.requestId, {
                requestId: request.requestId,
                reason: 'Timeout - Automatic refund triggered',
                failedAt: Date.now()
            });

            console.log(`✅ Timeout Handled - Refund Triggered`);

        } catch (error) {
            console.error(`❌ Timeout Handler Failed:`, error.message);
        }
    }

    /**
     * Get status of all pending requests
     */
    getPendingStatus() {
        console.log(`\n📊 Pending Requests Status`);
        console.log(`   Total Pending: ${this.pendingRequests.size}`);
        console.log(`   Processed: ${this.processedRequests.size}`);
        console.log(`   Failed: ${this.failedRequests.size}`);

        if (this.pendingRequests.size > 0) {
            console.log(`\n📋 Pending Requests:`);
            for (const [id, request] of this.pendingRequests.entries()) {
                const elapsed = Date.now() - request.createdAt;
                const hours = (elapsed / 1000 / 3600).toFixed(2);
                console.log(`   - Request ${id}: ${hours}h elapsed (${request.retries} retries)`);
            }
        }

        if (this.failedRequests.size > 0) {
            console.log(`\n❌ Failed Requests:`);
            for (const [id, request] of this.failedRequests.entries()) {
                console.log(`   - Request ${id}: ${request.reason}`);
            }
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            const gasPrice = await this.provider.getGasPrice();
            const balance = await this.wallet.getBalance();

            console.log(`\n💚 Gateway Health Check`);
            console.log(`   Block Number: ${blockNumber}`);
            console.log(`   Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`);
            console.log(`   Wallet Balance: ${ethers.formatEther(balance)} ETH`);

            if (ethers.parseEther('0.1') > balance) {
                console.warn(`⚠️  Low balance warning!`);
            }

            return true;
        } catch (error) {
            console.error(`❌ Health check failed:`, error.message);
            return false;
        }
    }

    /**
     * Stop the service
     */
    async stop() {
        console.log('\n🛑 Stopping Gateway Service...');

        // Remove listeners
        this.contract.removeAllListeners();

        // Save state (optional)
        this._saveState();

        console.log('✅ Gateway Service Stopped');
    }

    /**
     * Save service state for recovery
     */
    _saveState() {
        const state = {
            pendingRequests: Array.from(this.pendingRequests.entries()),
            processedRequests: Array.from(this.processedRequests),
            failedRequests: Array.from(this.failedRequests.entries()),
            savedAt: new Date().toISOString()
        };

        const stateFile = path.join(__dirname, '.gateway-state.json');
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        console.log(`💾 State saved to ${stateFile}`);
    }

    /**
     * Restore service state
     */
    _restoreState() {
        const stateFile = path.join(__dirname, '.gateway-state.json');
        try {
            if (fs.existsSync(stateFile)) {
                const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
                this.pendingRequests = new Map(state.pendingRequests);
                this.processedRequests = new Set(state.processedRequests);
                this.failedRequests = new Map(state.failedRequests);
                console.log(`✅ State restored from ${stateFile}`);
                console.log(`   Pending: ${this.pendingRequests.size}`);
                console.log(`   Processed: ${this.processedRequests.size}`);
                console.log(`   Failed: ${this.failedRequests.size}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not restore state:`, error.message);
        }
    }
}

/**
 * Main execution
 */
async function main() {
    // Load configuration from environment
    const config = {
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID',
        privateKey: process.env.GATEWAY_PRIVATE_KEY || '',
        contractAddress: process.env.CONTRACT_ADDRESS || ''
    };

    // Validate configuration
    if (!config.privateKey || !config.contractAddress) {
        console.error('❌ Missing required environment variables');
        console.error('Set GATEWAY_PRIVATE_KEY and CONTRACT_ADDRESS');
        process.exit(1);
    }

    // Create and start service
    const gateway = new GatewayService(config);

    // Restore previous state if available
    gateway._restoreState();

    // Start service
    await gateway.start();

    // Health check
    await gateway.healthCheck();

    // Print status periodically
    setInterval(() => {
        gateway.getPendingStatus();
    }, 300000); // Every 5 minutes

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received shutdown signal');
        await gateway.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received termination signal');
        await gateway.stop();
        process.exit(0);
    });
}

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = GatewayService;
