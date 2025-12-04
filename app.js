// Confidential Futures Trading DApp
// Real blockchain interaction implementation

class ConfidentialFuturesApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isOwner = false;

        this.contractAddress = "0x8FC127f65f36d77e580f96e8a51cF3A7e0f3EB9c";

        // Contract ABI (simplified for the main functions)
        this.contractABI = [
            "function owner() view returns (address)",
            "function currentContractId() view returns (uint32)",
            "function isSettlementTime() view returns (bool)",
            "function isContractActive(uint32 contractId) view returns (bool)",
            "function createFuturesContract(string memory underlying)",
            "function setContractPrice(uint32 contractId, uint32 initialPrice)",
            "function openPosition(uint32 contractId, uint32 entryPrice, uint64 amount, uint64 collateral, bool isLong)",
            "function settleContract(uint32 contractId, uint32 finalPrice)",
            "function getContractInfo(uint32 contractId) view returns (bool priceSet, bool settled, uint256 expiryTime, uint256 creationTime, string memory underlying, uint256 traderCount)",
            "function getTraderPositionStatus(uint32 contractId, address trader) view returns (bool hasPosition, bool isLong, uint256 entryTime)",
            "function getTimeToNextSettlement() view returns (uint256)",
            "function requestWithdrawal()",
            "function getActiveContractsCount() view returns (uint32)",
            "event ContractCreated(uint32 indexed contractId, string underlying, uint256 expiryTime)",
            "event PositionOpened(address indexed trader, uint32 indexed contractId, bool isLong)",
            "event ContractSettled(uint32 indexed contractId, uint32 settlementPrice)",
            "event ProfitDistributed(address indexed trader, uint32 indexed contractId)"
        ];

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkWalletConnection();
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());

        // Owner functions
        document.getElementById('createContract').addEventListener('click', () => this.createContract());
        document.getElementById('setPrice').addEventListener('click', () => this.setContractPrice());
        document.getElementById('settleContract').addEventListener('click', () => this.settleContract());

        // Trading functions
        document.getElementById('openPosition').addEventListener('click', () => this.openPosition());

        // Query functions
        document.getElementById('queryContract').addEventListener('click', () => this.queryContract());
        document.getElementById('refreshContracts').addEventListener('click', () => this.refreshContracts());
        document.getElementById('queryPosition').addEventListener('click', () => this.queryPosition());
        document.getElementById('checkSettlement').addEventListener('click', () => this.checkSettlementTime());
        document.getElementById('requestWithdrawal').addEventListener('click', () => this.requestWithdrawal());

        // Close status
        document.getElementById('closeStatus').addEventListener('click', () => this.hideStatus());

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.connectWallet();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showStatus('Please install MetaMask to use this application', 'error');
                return;
            }

            this.showStatus('Connecting to wallet...', 'info');

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Create contract instance
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

            // Update UI
            await this.updateWalletInfo();
            await this.checkOwnerStatus();

            this.showStatus('Wallet connected successfully!', 'success');

        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showStatus('Error connecting wallet: ' + error.message, 'error');
        }
    }

    async updateWalletInfo() {
        try {
            // Update connection status
            document.getElementById('connectionStatus').textContent = 'Connected';
            document.getElementById('connectionStatus').classList.add('connected');
            document.getElementById('connectWallet').textContent = 'Connected';
            document.getElementById('connectWallet').disabled = true;

            // Update wallet address
            document.getElementById('walletAddress').textContent =
                this.userAddress.slice(0, 6) + '...' + this.userAddress.slice(-4);

            // Update network info
            const network = await this.provider.getNetwork();
            document.getElementById('networkName').textContent = network.name;

            // Update balance
            const balance = await this.provider.getBalance(this.userAddress);
            document.getElementById('ethBalance').textContent =
                parseFloat(ethers.utils.formatEther(balance)).toFixed(4) + ' ETH';

        } catch (error) {
            console.error('Error updating wallet info:', error);
        }
    }

    async checkOwnerStatus() {
        try {
            const owner = await this.contract.owner();
            this.isOwner = owner.toLowerCase() === this.userAddress.toLowerCase();

            if (this.isOwner) {
                document.getElementById('ownerSection').style.display = 'block';
            }
        } catch (error) {
            console.error('Error checking owner status:', error);
        }
    }

    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isOwner = false;

        // Reset UI
        document.getElementById('connectionStatus').textContent = 'Not Connected';
        document.getElementById('connectionStatus').classList.remove('connected');
        document.getElementById('connectWallet').textContent = 'Connect Wallet';
        document.getElementById('connectWallet').disabled = false;
        document.getElementById('walletAddress').textContent = 'Not connected';
        document.getElementById('networkName').textContent = 'Unknown';
        document.getElementById('ethBalance').textContent = '0 ETH';
        document.getElementById('ownerSection').style.display = 'none';
    }

    // Owner Functions
    async createContract() {
        if (!this.contract || !this.isOwner) {
            this.showStatus('Only contract owner can create contracts', 'error');
            return;
        }

        const underlying = document.getElementById('underlyingAsset').value.trim();
        if (!underlying) {
            this.showStatus('Please enter an underlying asset', 'error');
            return;
        }

        try {
            this.showStatus('Creating futures contract...', 'info');

            const tx = await this.contract.createFuturesContract(underlying);
            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');

            const receipt = await tx.wait();

            // Extract contract ID from event
            const event = receipt.events?.find(e => e.event === 'ContractCreated');
            const contractId = event?.args?.contractId;

            this.showStatus(`Contract created successfully! Contract ID: ${contractId}`, 'success');
            document.getElementById('underlyingAsset').value = '';

        } catch (error) {
            console.error('Error creating contract:', error);
            this.showStatus('Error creating contract: ' + this.getErrorMessage(error), 'error');
        }
    }

    async setContractPrice() {
        if (!this.contract || !this.isOwner) {
            this.showStatus('Only contract owner can set prices', 'error');
            return;
        }

        const contractId = parseInt(document.getElementById('contractIdPrice').value);
        const price = parseInt(document.getElementById('initialPrice').value);

        if (!contractId || !price) {
            this.showStatus('Please enter contract ID and price', 'error');
            return;
        }

        try {
            this.showStatus('Setting contract price...', 'info');

            const tx = await this.contract.setContractPrice(contractId, price);
            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus(`Price set successfully for contract ${contractId}!`, 'success');

            document.getElementById('contractIdPrice').value = '';
            document.getElementById('initialPrice').value = '';

        } catch (error) {
            console.error('Error setting price:', error);
            this.showStatus('Error setting price: ' + this.getErrorMessage(error), 'error');
        }
    }

    async settleContract() {
        if (!this.contract || !this.isOwner) {
            this.showStatus('Only contract owner can settle contracts', 'error');
            return;
        }

        const contractId = parseInt(document.getElementById('settleContractId').value);
        const finalPrice = parseInt(document.getElementById('finalPrice').value);

        if (!contractId || !finalPrice) {
            this.showStatus('Please enter contract ID and final price', 'error');
            return;
        }

        try {
            this.showStatus('Settling contract...', 'info');

            const tx = await this.contract.settleContract(contractId, finalPrice);
            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus(`Contract ${contractId} settled successfully!`, 'success');

            document.getElementById('settleContractId').value = '';
            document.getElementById('finalPrice').value = '';

        } catch (error) {
            console.error('Error settling contract:', error);
            this.showStatus('Error settling contract: ' + this.getErrorMessage(error), 'error');
        }
    }

    // Trading Functions
    async openPosition() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        const contractId = parseInt(document.getElementById('tradingContractId').value);
        const entryPrice = parseInt(document.getElementById('entryPrice').value);
        const amount = parseInt(document.getElementById('tradeAmount').value);
        const collateral = parseInt(document.getElementById('collateral').value);
        const isLong = document.querySelector('input[name="positionType"]:checked').value === 'true';

        if (!contractId || !entryPrice || !amount || !collateral) {
            this.showStatus('Please fill in all trading fields', 'error');
            return;
        }

        try {
            this.showStatus('Opening position...', 'info');

            const tx = await this.contract.openPosition(
                contractId,
                entryPrice,
                amount,
                collateral,
                isLong
            );
            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus(`Position opened successfully! Contract: ${contractId}, Type: ${isLong ? 'Long' : 'Short'}`, 'success');

            // Clear form
            document.getElementById('tradingContractId').value = '';
            document.getElementById('entryPrice').value = '';
            document.getElementById('tradeAmount').value = '';
            document.getElementById('collateral').value = '';

        } catch (error) {
            console.error('Error opening position:', error);
            this.showStatus('Error opening position: ' + this.getErrorMessage(error), 'error');
        }
    }

    // Query Functions
    async queryContract() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        const contractId = parseInt(document.getElementById('queryContractId').value);
        if (!contractId) {
            this.showStatus('Please enter a contract ID', 'error');
            return;
        }

        try {
            const [priceSet, settled, expiryTime, creationTime, underlying, traderCount] =
                await this.contract.getContractInfo(contractId);

            const isActive = await this.contract.isContractActive(contractId);

            const contractInfo = `
                <div class="contract-item">
                    <h4>Contract ${contractId} - ${underlying}</h4>
                    <p><strong>Status:</strong> <span class="${settled ? 'status-settled' : (isActive ? 'status-active' : 'status-pending')}">${settled ? 'Settled' : (isActive ? 'Active' : 'Inactive')}</span></p>
                    <p><strong>Price Set:</strong> ${priceSet ? 'Yes' : 'No'}</p>
                    <p><strong>Creation Time:</strong> ${new Date(creationTime * 1000).toLocaleString()}</p>
                    <p><strong>Expiry Time:</strong> ${new Date(expiryTime * 1000).toLocaleString()}</p>
                    <p><strong>Traders Count:</strong> ${traderCount}</p>
                </div>
            `;

            document.getElementById('contractsList').innerHTML = contractInfo;

        } catch (error) {
            console.error('Error querying contract:', error);
            this.showStatus('Error querying contract: ' + this.getErrorMessage(error), 'error');
        }
    }

    async refreshContracts() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const currentId = await this.contract.currentContractId();
            const activeCount = await this.contract.getActiveContractsCount();

            let contractsHTML = `<p><strong>Total Contracts Created:</strong> ${currentId - 1}</p>`;
            contractsHTML += `<p><strong>Active Contracts:</strong> ${activeCount}</p>`;

            // Query recent contracts
            for (let i = Math.max(1, currentId - 5); i < currentId; i++) {
                try {
                    const [priceSet, settled, expiryTime, creationTime, underlying, traderCount] =
                        await this.contract.getContractInfo(i);

                    const isActive = await this.contract.isContractActive(i);

                    contractsHTML += `
                        <div class="contract-item">
                            <h4>Contract ${i} - ${underlying}</h4>
                            <p><strong>Status:</strong> <span class="${settled ? 'status-settled' : (isActive ? 'status-active' : 'status-pending')}">${settled ? 'Settled' : (isActive ? 'Active' : 'Inactive')}</span></p>
                            <p><strong>Price Set:</strong> ${priceSet ? 'Yes' : 'No'}</p>
                            <p><strong>Traders:</strong> ${traderCount}</p>
                            <p><strong>Expires:</strong> ${new Date(expiryTime * 1000).toLocaleString()}</p>
                        </div>
                    `;
                } catch (err) {
                    // Skip invalid contracts
                }
            }

            document.getElementById('contractsList').innerHTML = contractsHTML;

        } catch (error) {
            console.error('Error refreshing contracts:', error);
            this.showStatus('Error refreshing contracts: ' + this.getErrorMessage(error), 'error');
        }
    }

    async queryPosition() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        const contractId = parseInt(document.getElementById('positionContractId').value);
        if (!contractId) {
            this.showStatus('Please enter a contract ID', 'error');
            return;
        }

        try {
            const [hasPosition, isLong, entryTime] =
                await this.contract.getTraderPositionStatus(contractId, this.userAddress);

            let positionHTML;
            if (hasPosition) {
                positionHTML = `
                    <div class="position-item">
                        <h4>Position in Contract ${contractId}</h4>
                        <p><strong>Type:</strong> ${isLong ? 'Long' : 'Short'}</p>
                        <p><strong>Entry Time:</strong> ${new Date(entryTime * 1000).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span class="status-active">Active</span></p>
                    </div>
                `;
            } else {
                positionHTML = `<p>No position found in contract ${contractId}</p>`;
            }

            document.getElementById('positionsList').innerHTML = positionHTML;

        } catch (error) {
            console.error('Error querying position:', error);
            this.showStatus('Error querying position: ' + this.getErrorMessage(error), 'error');
        }
    }

    async checkSettlementTime() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            const isSettlementTime = await this.contract.isSettlementTime();
            const timeToNext = await this.contract.getTimeToNextSettlement();

            let settlementHTML;
            if (isSettlementTime) {
                settlementHTML = '<p><strong>Settlement Status:</strong> <span class="status-active">Ready for Settlement</span></p>';
            } else {
                const hours = Math.floor(timeToNext / 3600);
                const minutes = Math.floor((timeToNext % 3600) / 60);
                settlementHTML = `<p><strong>Time to Next Settlement:</strong> ${hours}h ${minutes}m</p>`;
            }

            document.getElementById('settlementTime').innerHTML = settlementHTML;

        } catch (error) {
            console.error('Error checking settlement time:', error);
            this.showStatus('Error checking settlement time: ' + this.getErrorMessage(error), 'error');
        }
    }

    async requestWithdrawal() {
        if (!this.contract) {
            this.showStatus('Please connect your wallet first', 'error');
            return;
        }

        try {
            this.showStatus('Requesting withdrawal...', 'info');

            const tx = await this.contract.requestWithdrawal();
            this.showStatus('Transaction submitted. Waiting for confirmation...', 'info');

            await tx.wait();
            this.showStatus('Withdrawal request submitted successfully!', 'success');

        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            this.showStatus('Error requesting withdrawal: ' + this.getErrorMessage(error), 'error');
        }
    }

    // Utility Functions
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('transactionStatus');
        const statusContent = statusDiv.querySelector('.status-content');
        const statusMessage = document.getElementById('statusMessage');

        statusMessage.textContent = message;
        statusContent.className = `status-content ${type}`;
        statusDiv.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => this.hideStatus(), 5000);
        }
    }

    hideStatus() {
        document.getElementById('transactionStatus').style.display = 'none';
    }

    getErrorMessage(error) {
        if (error.code === 4001) {
            return 'Transaction rejected by user';
        } else if (error.code === -32603) {
            return 'Internal JSON-RPC error';
        } else if (error.message) {
            return error.message;
        }
        return 'Unknown error occurred';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConfidentialFuturesApp();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});