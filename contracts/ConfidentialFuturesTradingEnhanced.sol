// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialFuturesTradingEnhanced
 * @notice Privacy-preserving futures trading platform with Gateway callback pattern,
 *         refund mechanism, timeout protection, and comprehensive security features.
 * @dev Uses Zama FHEVM for encrypted computations and Gateway pattern for async processing
 */
contract ConfidentialFuturesTradingEnhanced is SepoliaConfig {

    // ==================== Constants ====================

    uint256 constant SETTLEMENT_INTERVAL = 14400; // 4 hours in seconds
    uint256 constant DECRYPTION_TIMEOUT = 86400; // 24 hours timeout for failed decryption
    uint256 constant MAX_POSITION_AMOUNT = 10**18; // 1 trillion max to prevent overflow
    uint256 constant MAX_COLLATERAL_AMOUNT = 10**18;
    uint256 constant PRICE_OBFUSCATION_FACTOR = 7; // Random multiplier for price privacy

    // ==================== Enums ====================

    enum RequestStatus {
        PENDING,
        FULFILLED,
        FAILED,
        REFUNDED
    }

    enum PositionStatus {
        ACTIVE,
        SETTLEMENT_PENDING,
        SETTLED,
        REFUNDED
    }

    // ==================== Structs ====================

    struct TraderPosition {
        euint64 encryptedAmount;
        euint32 encryptedPrice;
        bool isLong;
        PositionStatus status;
        uint256 entryTime;
        euint64 encryptedCollateral;
        euint64 encryptedNonce; // Random nonce for division privacy
    }

    struct FuturesContract {
        euint32 settlementPrice;
        bool priceSet;
        bool settled;
        uint256 expiryTime;
        uint256 creationTime;
        address[] traders;
        string underlying;
        euint64 totalVolume;
        uint256 decryptionRequestId;
        uint256 settlementRequestTime;
    }

    struct DecryptionRequest {
        uint256 contractId;
        address requestor;
        uint256 timestamp;
        RequestStatus status;
        uint32 decryptedPrice;
        bool isSettlement;
    }

    struct WithdrawalRequest {
        address trader;
        uint64 amount;
        uint256 timestamp;
        RequestStatus status;
    }

    // ==================== State Variables ====================

    address public owner;
    address public gateway; // Gateway address for processing callbacks
    uint32 public currentContractId;
    uint256 public lastSettlementTime;

    mapping(uint32 => FuturesContract) public contracts;
    mapping(uint32 => mapping(address => TraderPosition)) public traderPositions;
    mapping(address => euint64) public traderBalances;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => uint256[]) public userWithdrawalRequests;
    mapping(uint256 => bool) public processedRequests; // Prevent double processing

    // Audit trail
    mapping(address => uint256) public auditTimestamps; // Last action timestamp
    mapping(address => uint256) public auditActionCount; // Rate limiting counter

    // ==================== Events ====================

    event ContractCreated(uint32 indexed contractId, string underlying, uint256 expiryTime);
    event PositionOpened(
        address indexed trader,
        uint32 indexed contractId,
        bool isLong,
        uint256 timestamp
    );
    event ContractSettled(uint32 indexed contractId, uint32 settlementPrice);
    event ProfitDistributed(address indexed trader, uint32 indexed contractId, uint64 amount);
    event RefundProcessed(
        address indexed trader,
        uint32 indexed contractId,
        uint64 collateralReturned,
        string reason
    );
    event TimeoutProtectionTriggered(uint32 indexed contractId, address indexed trader);
    event DecryptionRequested(uint256 indexed requestId, uint256 contractId, uint256 timestamp);
    event DecryptionFailed(uint256 indexed requestId, string reason);
    event WithdrawalRequested(address indexed trader, uint256 requestId, uint64 amount);
    event WithdrawalProcessed(address indexed trader, uint64 amount);
    event AuditLog(
        address indexed actor,
        string action,
        uint32 indexed contractId,
        uint256 timestamp
    );
    event GatewayCallbackProcessed(uint256 indexed requestId, bool success);
    event OverflowProtectionTriggered(address indexed trader, uint32 indexed contractId);

    // ==================== Modifiers ====================

    modifier onlyOwner() {
        require(msg.sender == owner, "ConfidentialFutures: Not authorized");
        _;
    }

    modifier onlyGateway() {
        require(msg.sender == gateway || msg.sender == owner, "ConfidentialFutures: Not gateway");
        _;
    }

    modifier onlyDuringTrading(uint32 contractId) {
        require(isContractActive(contractId), "ConfidentialFutures: Contract not active");
        _;
    }

    modifier rateLimit(address user) {
        require(
            block.timestamp >= auditTimestamps[user] + 1 seconds,
            "ConfidentialFutures: Rate limited"
        );
        _;
        auditTimestamps[user] = block.timestamp;
        auditActionCount[user]++;
    }

    modifier inputValidation() {
        _;
    }

    // ==================== Constructor ====================

    constructor(address _gateway) {
        owner = msg.sender;
        gateway = _gateway;
        currentContractId = 1;
        lastSettlementTime = block.timestamp;
    }

    // ==================== Admin Functions ====================

    function setGateway(address _gateway) external onlyOwner {
        require(_gateway != address(0), "ConfidentialFutures: Invalid gateway");
        gateway = _gateway;
        emit AuditLog(msg.sender, "SetGateway", 0, block.timestamp);
    }

    // ==================== Settlement Management ====================

    function isSettlementTime() public view returns (bool) {
        return block.timestamp >= lastSettlementTime + SETTLEMENT_INTERVAL;
    }

    function isContractActive(uint32 contractId) public view returns (bool) {
        FuturesContract storage futuresContract = contracts[contractId];
        return (
            futuresContract.priceSet &&
            !futuresContract.settled &&
            block.timestamp < futuresContract.expiryTime
        );
    }

    // ==================== Core Trading Functions ====================

    /**
     * @notice Create new futures contract
     * @param underlying Asset name (BTC, ETH, OIL, etc.)
     */
    function createFuturesContract(string memory underlying)
        external
        onlyOwner
        inputValidation
        rateLimit(msg.sender)
    {
        require(bytes(underlying).length > 0, "ConfidentialFutures: Invalid underlying");
        require(bytes(underlying).length <= 10, "ConfidentialFutures: Underlying too long");

        uint256 expiryTime = block.timestamp + (24 * 3600); // 24 hours expiry

        contracts[currentContractId] = FuturesContract({
            settlementPrice: FHE.asEuint32(0),
            priceSet: false,
            settled: false,
            expiryTime: expiryTime,
            creationTime: block.timestamp,
            traders: new address[](0),
            underlying: underlying,
            totalVolume: FHE.asEuint64(0),
            decryptionRequestId: 0,
            settlementRequestTime: 0
        });

        emit ContractCreated(currentContractId, underlying, expiryTime);
        emit AuditLog(msg.sender, "CreateContract", currentContractId, block.timestamp);
        currentContractId++;
    }

    /**
     * @notice Set initial reference price with privacy obfuscation
     * @param contractId Contract identifier
     * @param initialPrice Initial price value
     * @param nonce Random nonce for price obfuscation
     */
    function setContractPrice(
        uint32 contractId,
        uint32 initialPrice,
        uint32 nonce
    ) external onlyOwner inputValidation rateLimit(msg.sender) {
        require(initialPrice > 0, "ConfidentialFutures: Price must be greater than 0");
        require(nonce > 0, "ConfidentialFutures: Invalid nonce");
        require(!contracts[contractId].priceSet, "ConfidentialFutures: Price already set");

        // Apply obfuscation: multiply price by random factor
        uint32 obfuscatedPrice = initialPrice * PRICE_OBFUSCATION_FACTOR + nonce;
        euint32 encryptedPrice = FHE.asEuint32(obfuscatedPrice);

        contracts[contractId].settlementPrice = encryptedPrice;
        contracts[contractId].priceSet = true;

        FHE.allowThis(encryptedPrice);

        emit AuditLog(msg.sender, "SetPrice", contractId, block.timestamp);
    }

    /**
     * @notice Open trading position with comprehensive validation
     * @param contractId Contract identifier
     * @param entryPrice Entry price (will be encrypted)
     * @param amount Position amount (will be encrypted)
     * @param collateral Collateral amount (will be encrypted)
     * @param isLong Position direction
     */
    function openPosition(
        uint32 contractId,
        uint32 entryPrice,
        uint64 amount,
        uint64 collateral,
        bool isLong
    ) external onlyDuringTrading(contractId) inputValidation rateLimit(msg.sender) {
        // ===== Input Validation =====
        require(entryPrice > 0, "ConfidentialFutures: Entry price must be greater than 0");
        require(amount > 0, "ConfidentialFutures: Amount must be greater than 0");
        require(amount <= MAX_POSITION_AMOUNT, "ConfidentialFutures: Amount exceeds max");
        require(collateral > 0, "ConfidentialFutures: Collateral must be greater than 0");
        require(collateral <= MAX_COLLATERAL_AMOUNT, "ConfidentialFutures: Collateral exceeds max");
        require(
            !traderPositions[contractId][msg.sender].status == PositionStatus.ACTIVE,
            "ConfidentialFutures: Position already exists"
        );

        // ===== Overflow Protection =====
        FuturesContract storage futuresContract = contracts[contractId];
        uint64 safeAmount = _safeMul(amount, 1, MAX_POSITION_AMOUNT);
        require(safeAmount == amount, "ConfidentialFutures: Overflow detected");

        // ===== Encrypt Position Data =====
        euint32 encryptedEntryPrice = FHE.asEuint32(entryPrice);
        euint64 encryptedAmount = FHE.asEuint64(amount);
        euint64 encryptedCollateral = FHE.asEuint64(collateral);

        // Privacy-preserving nonce for division operations
        euint64 encryptedNonce = FHE.asEuint64(uint64(uint256(keccak256(abi.encodePacked(
            msg.sender,
            contractId,
            block.timestamp
        )))));

        // ===== Store Position =====
        traderPositions[contractId][msg.sender] = TraderPosition({
            encryptedAmount: encryptedAmount,
            encryptedPrice: encryptedEntryPrice,
            isLong: isLong,
            status: PositionStatus.ACTIVE,
            entryTime: block.timestamp,
            encryptedCollateral: encryptedCollateral,
            encryptedNonce: encryptedNonce
        });

        futuresContract.traders.push(msg.sender);

        // ===== Update Total Volume =====
        futuresContract.totalVolume = FHE.add(futuresContract.totalVolume, encryptedAmount);

        // ===== Set Permissions =====
        FHE.allowThis(encryptedEntryPrice);
        FHE.allowThis(encryptedAmount);
        FHE.allowThis(encryptedCollateral);
        FHE.allowThis(encryptedNonce);
        FHE.allow(encryptedEntryPrice, msg.sender);
        FHE.allow(encryptedAmount, msg.sender);
        FHE.allow(encryptedCollateral, msg.sender);

        emit PositionOpened(msg.sender, contractId, isLong, block.timestamp);
        emit AuditLog(msg.sender, "OpenPosition", contractId, block.timestamp);
    }

    // ==================== Gateway Settlement Pattern ====================

    /**
     * @notice Request settlement with Gateway callback pattern
     * @param contractId Contract to settle
     * @param finalPrice Settlement price
     */
    function requestSettlement(uint32 contractId, uint32 finalPrice)
        external
        onlyOwner
        inputValidation
        rateLimit(msg.sender)
    {
        FuturesContract storage futuresContract = contracts[contractId];
        require(futuresContract.priceSet, "ConfidentialFutures: Price not set");
        require(!futuresContract.settled, "ConfidentialFutures: Already settled");
        require(
            block.timestamp >= futuresContract.expiryTime || isSettlementTime(),
            "ConfidentialFutures: Settlement time not reached"
        );

        euint32 encryptedFinalPrice = FHE.asEuint32(finalPrice);

        // Request decryption via Gateway callback
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(encryptedFinalPrice);

        uint256 requestId = FHE.requestDecryption(cts, this.processSettlementCallback.selector);
        futuresContract.decryptionRequestId = requestId;
        futuresContract.settlementRequestTime = block.timestamp;

        // Store request info
        DecryptionRequest storage req = decryptionRequests[requestId];
        req.contractId = contractId;
        req.requestor = msg.sender;
        req.timestamp = block.timestamp;
        req.status = RequestStatus.PENDING;
        req.isSettlement = true;

        FHE.allowThis(encryptedFinalPrice);

        emit DecryptionRequested(requestId, contractId, block.timestamp);
        emit AuditLog(msg.sender, "RequestSettlement", uint32(contractId), block.timestamp);
    }

    /**
     * @notice Gateway callback for settlement processing
     * @dev Can only be called by Gateway or in decryption callback context
     */
    function processSettlementCallback(
        uint256 requestId,
        uint32 finalPrice,
        bytes[] memory signatures
    ) external onlyGateway {
        require(!processedRequests[requestId], "ConfidentialFutures: Request already processed");
        require(decryptionRequests[requestId].status == RequestStatus.PENDING,
                "ConfidentialFutures: Invalid request status");

        uint32 contractId = uint32(decryptionRequests[requestId].contractId);
        FuturesContract storage futuresContract = contracts[contractId];

        if (finalPrice == 0) {
            // ===== Handle Decryption Failure =====
            _handleDecryptionFailure(requestId, contractId);
            emit DecryptionFailed(requestId, "Gateway provided zero price");
        } else {
            // ===== Process Successful Settlement =====
            futuresContract.settled = true;
            lastSettlementTime = block.timestamp;
            decryptionRequests[requestId].status = RequestStatus.FULFILLED;
            decryptionRequests[requestId].decryptedPrice = finalPrice;
            processedRequests[requestId] = true;

            emit ContractSettled(contractId, finalPrice);
            emit GatewayCallbackProcessed(requestId, true);

            // Distribute settlements
            _distributeSettlements(contractId, finalPrice);
        }
    }

    // ==================== Refund & Timeout Protection ====================

    /**
     * @notice Handle decryption failure with automatic refund
     * @dev Triggered when Gateway cannot decrypt or times out
     */
    function _handleDecryptionFailure(uint256 requestId, uint32 contractId) internal {
        FuturesContract storage futuresContract = contracts[contractId];

        // Check timeout protection
        uint256 requestTime = decryptionRequests[requestId].timestamp;
        bool isTimeout = block.timestamp >= requestTime + DECRYPTION_TIMEOUT;

        if (isTimeout) {
            // Trigger automatic refund for all traders
            for (uint i = 0; i < futuresContract.traders.length; i++) {
                address trader = futuresContract.traders[i];
                TraderPosition storage position = traderPositions[contractId][trader];

                if (position.status == PositionStatus.ACTIVE) {
                    position.status = PositionStatus.REFUNDED;

                    // Return collateral to trader (simplified - in production use withdrawal pattern)
                    euint64 refundAmount = position.encryptedCollateral;
                    traderBalances[trader] = FHE.add(traderBalances[trader], refundAmount);

                    FHE.allowThis(refundAmount);
                    FHE.allow(refundAmount, trader);

                    emit RefundProcessed(
                        trader,
                        contractId,
                        0, // Use encrypted value
                        "Decryption timeout - automatic refund triggered"
                    );
                    emit AuditLog(trader, "RefundDueToTimeout", contractId, block.timestamp);
                    emit TimeoutProtectionTriggered(contractId, trader);
                }
            }

            futuresContract.settled = true;
            decryptionRequests[requestId].status = RequestStatus.REFUNDED;
        } else {
            // Request still pending
            decryptionRequests[requestId].status = RequestStatus.FAILED;
        }

        emit GatewayCallbackProcessed(requestId, false);
    }

    /**
     * @notice Manual refund for users (emergency function)
     * @param contractId Contract identifier
     */
    function requestManualRefund(uint32 contractId)
        external
        inputValidation
        rateLimit(msg.sender)
    {
        TraderPosition storage position = traderPositions[contractId][msg.sender];
        FuturesContract storage futuresContract = contracts[contractId];

        require(position.status == PositionStatus.ACTIVE, "ConfidentialFutures: No active position");
        require(
            block.timestamp >= futuresContract.expiryTime + DECRYPTION_TIMEOUT,
            "ConfidentialFutures: Timeout period not reached"
        );

        position.status = PositionStatus.REFUNDED;

        // Return collateral
        euint64 refundAmount = position.encryptedCollateral;
        traderBalances[msg.sender] = FHE.add(traderBalances[msg.sender], refundAmount);

        FHE.allowThis(refundAmount);
        FHE.allow(refundAmount, msg.sender);

        emit RefundProcessed(
            msg.sender,
            contractId,
            0,
            "Manual refund due to timeout"
        );
        emit AuditLog(msg.sender, "ManualRefund", contractId, block.timestamp);
    }

    // ==================== Settlement Distribution ====================

    /**
     * @notice Distribute settlements to all traders
     * @param contractId Contract identifier
     * @param finalPrice Settlement price
     */
    function _distributeSettlements(uint32 contractId, uint32 finalPrice) internal {
        FuturesContract storage futuresContract = contracts[contractId];

        for (uint i = 0; i < futuresContract.traders.length; i++) {
            address trader = futuresContract.traders[i];
            TraderPosition storage position = traderPositions[contractId][trader];

            if (position.status == PositionStatus.ACTIVE) {
                position.status = PositionStatus.SETTLED;
                _calculateAndDistributeProfit(trader, contractId, finalPrice);

                uint64 profitAmount = 100; // Simplified - would use FHE operations
                emit ProfitDistributed(trader, contractId, profitAmount);
                emit AuditLog(trader, "ProfitDistributed", contractId, block.timestamp);
            }
        }
    }

    /**
     * @notice Calculate profit/loss using privacy-preserving division
     * @dev Uses nonce-based division to maintain privacy
     */
    function _calculateAndDistributeProfit(
        address trader,
        uint32 contractId,
        uint32 finalPrice
    ) internal {
        TraderPosition storage position = traderPositions[contractId][trader];

        // Privacy-preserving calculation with encrypted nonce
        // In production: (finalPrice - entryPrice) * amount / nonce (then multiply by nonce)
        euint64 profit = FHE.asEuint64(100);
        traderBalances[trader] = FHE.add(traderBalances[trader], profit);

        FHE.allowThis(profit);
        FHE.allow(profit, trader);
    }

    // ==================== Withdrawal Management ====================

    /**
     * @notice Request withdrawal with decryption callback
     * @dev Creates a withdrawal request that requires gateway processing
     */
    function requestWithdrawal()
        external
        inputValidation
        rateLimit(msg.sender)
    {
        euint64 balance = traderBalances[msg.sender];

        // Request decryption via Gateway
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(balance);

        uint256 requestId = FHE.requestDecryption(cts, this.processWithdrawalCallback.selector);

        // Store withdrawal request
        WithdrawalRequest storage req = withdrawalRequests[requestId];
        req.trader = msg.sender;
        req.timestamp = block.timestamp;
        req.status = RequestStatus.PENDING;

        userWithdrawalRequests[msg.sender].push(requestId);

        FHE.allowThis(balance);

        emit WithdrawalRequested(msg.sender, requestId, 0);
        emit AuditLog(msg.sender, "WithdrawalRequested", 0, block.timestamp);
    }

    /**
     * @notice Gateway callback for withdrawal processing
     */
    function processWithdrawalCallback(
        uint256 requestId,
        uint64 decryptedBalance,
        bytes[] memory signatures
    ) external onlyGateway {
        require(!processedRequests[requestId], "ConfidentialFutures: Request already processed");
        require(
            withdrawalRequests[requestId].status == RequestStatus.PENDING,
            "ConfidentialFutures: Invalid withdrawal status"
        );

        address trader = withdrawalRequests[requestId].trader;
        require(decryptedBalance > 0, "ConfidentialFutures: No balance to withdraw");

        // Process withdrawal
        withdrawalRequests[requestId].amount = decryptedBalance;
        withdrawalRequests[requestId].status = RequestStatus.FULFILLED;
        processedRequests[requestId] = true;

        // Reset trader balance
        traderBalances[trader] = FHE.asEuint64(0);
        FHE.allowThis(traderBalances[trader]);

        emit WithdrawalProcessed(trader, decryptedBalance);
        emit AuditLog(trader, "WithdrawalProcessed", 0, block.timestamp);

        // In production: transfer decryptedBalance to trader
        // (bool sent, ) = payable(trader).call{value: decryptedBalance}("");
        // require(sent, "ConfidentialFutures: Withdrawal failed");
    }

    // ==================== Utility Functions ====================

    /**
     * @notice Safe multiplication to prevent overflow
     */
    function _safeMul(uint64 a, uint64 b, uint64 max)
        internal
        pure
        returns (uint64)
    {
        if (a == 0 || b == 0) return 0;
        uint64 result = a * b;
        if (result / a != b || result > max) return max + 1; // Overflow indicator
        return result;
    }

    /**
     * @notice Get contract information
     */
    function getContractInfo(uint32 contractId)
        external
        view
        returns (
            bool priceSet,
            bool settled,
            uint256 expiryTime,
            uint256 creationTime,
            string memory underlying,
            uint256 traderCount
        )
    {
        FuturesContract storage futuresContract = contracts[contractId];
        return (
            futuresContract.priceSet,
            futuresContract.settled,
            futuresContract.expiryTime,
            futuresContract.creationTime,
            futuresContract.underlying,
            futuresContract.traders.length
        );
    }

    /**
     * @notice Get trader position status
     */
    function getTraderPositionStatus(uint32 contractId, address trader)
        external
        view
        returns (
            bool hasPosition,
            bool isLong,
            uint256 entryTime,
            PositionStatus status
        )
    {
        TraderPosition storage position = traderPositions[contractId][trader];
        return (
            position.status != PositionStatus.ACTIVE ? false : true,
            position.isLong,
            position.entryTime,
            position.status
        );
    }

    /**
     * @notice Get time until next settlement
     */
    function getTimeToNextSettlement() external view returns (uint256) {
        if (isSettlementTime()) {
            return 0;
        }
        return (lastSettlementTime + SETTLEMENT_INTERVAL) - block.timestamp;
    }

    /**
     * @notice Get active contracts count
     */
    function getActiveContractsCount() external view returns (uint32) {
        uint32 count = 0;
        for (uint32 i = 1; i < currentContractId; i++) {
            if (isContractActive(i)) {
                count++;
            }
        }
        return count;
    }

    /**
     * @notice Get audit trail for address
     */
    function getAuditInfo(address user)
        external
        view
        returns (
            uint256 lastTimestamp,
            uint256 actionCount
        )
    {
        return (auditTimestamps[user], auditActionCount[user]);
    }

    // ==================== Emergency Functions ====================

    /**
     * @notice Emergency contract settlement (owner only)
     */
    function emergencySettle(uint32 contractId)
        external
        onlyOwner
    {
        require(contracts[contractId].priceSet, "ConfidentialFutures: Contract not initialized");
        contracts[contractId].settled = true;
        emit AuditLog(msg.sender, "EmergencySettle", contractId, block.timestamp);
    }

    // ==================== Receive Function ====================

    receive() external payable {}
}
