// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.36;

import {IHoldByPartition} from "@hashgraph/asset-tokenization-contracts/contracts/facets/holdByPartition/IHoldByPartition.sol";
import {IHoldTypes} from "@hashgraph/asset-tokenization-contracts/contracts/facets/hold/IHoldTypes.sol";
import {ThirdPartyType} from "@hashgraph/asset-tokenization-contracts/contracts/domain/asset/types/ThirdPartyType.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Manually confirmed per-match delivery/payment on Hedera Testnet only.
/// @dev T07 order signatures convey no spending authority. Seller registers; buyer pays the digest.
contract NovaSettlement is ReentrancyGuard {
    address public constant ASSET = 0x261CE349dF182988FA25d00868cf6cF434220C24;
    address public constant ADMIN = 0xfd8FDb4989a916c6F2420a2116C356E34c889840;
    address public constant ACCOUNT_A = 0x740E4eF58151A169621622577a5B6D6FF5010836;
    address public constant ACCOUNT_B = 0xa1f2872EE7A9f74523ae0887a9dc428Ff1340706;
    bytes32 public constant PARTITION = bytes32(uint256(1));
    bytes32 public constant TYPEHASH = keccak256("HoldBook Settlement v1");
    bytes32 public marketSalt;
    struct Terms {
        bytes32 matchId;
        bytes32 sellerOrder;
        bytes32 buyerOrder;
        address seller;
        address buyer;
        uint256 amount;
        uint256 priceTinybars;
        uint256 preparedAt;
        uint256 expiry;
        uint256 holdId;
    }
    enum State { Unregistered, Ready, Settled, Cancelled, Reclaimed }
    mapping(bytes32 => Terms) private terms;
    mapping(bytes32 => State) public state;
    mapping(bytes32 => bytes32) public matchDigest;
    mapping(bytes32 => bool) public usedHold;
    error Invalid();
    error WrongAccount();
    error WrongHold();
    error Closed();
    error WrongExpiry();
    error WrongPayment();
    error DeliveryFailed();
    error PaymentFailed();
    event Setup(address indexed deployer, bytes32 marketSalt);
    event Registered(bytes32 indexed digest, bytes32 indexed matchId, address indexed seller, address buyer, uint256 holdId);
    event Settled(bytes32 indexed digest, address indexed seller, address indexed buyer, uint256 amount, uint256 tinybars, uint256 holdId);
    event Returned(bytes32 indexed digest, address indexed seller, uint256 indexed holdId, uint256 amount, bool reclaimed);

    constructor(bytes32 salt) {
        if (block.chainid != 296 || salt == bytes32(0)) revert Invalid();
        if (msg.sender != ADMIN) revert WrongAccount();
        marketSalt = salt;
        emit Setup(msg.sender, salt);
    }
    function digest(Terms memory t) public view returns (bytes32) {
        return keccak256(abi.encode(TYPEHASH, uint256(296), address(this), ASSET, marketSalt, t));
    }
    function getTerms(bytes32 id) external view returns (Terms memory) { return terms[id]; }
    function register(Terms calldata t) external nonReentrant returns (bytes32 id) {
        if (msg.sender != t.seller) revert WrongAccount();
        if (!((t.seller == ACCOUNT_A && t.buyer == ACCOUNT_B) || (t.seller == ACCOUNT_B && t.buyer == ACCOUNT_A))
            || t.matchId == 0 || t.sellerOrder == 0 || t.buyerOrder == 0 || t.sellerOrder == t.buyerOrder
            || t.amount == 0 || t.amount > 1000 || t.priceTinybars == 0
            || t.priceTinybars > uint256(uint64(type(int64).max)) / t.amount) revert Invalid();
        if (t.preparedAt > block.timestamp || t.expiry != t.preparedAt + 1800 || block.timestamp >= t.expiry) revert WrongExpiry();
        id = digest(t);
        bytes32 key = keccak256(abi.encode(t.seller, t.holdId));
        if (matchDigest[t.matchId] != 0 || usedHold[key]) revert Closed();
        _checkHold(t);
        usedHold[key] = true;
        matchDigest[t.matchId] = id;
        terms[id] = t;
        state[id] = State.Ready;
        emit Registered(id, t.matchId, t.seller, t.buyer, t.holdId);
    }
    function settle(bytes32 id) external payable nonReentrant {
        Terms memory t = _ready(id);
        if (msg.sender != t.buyer) revert WrongAccount();
        if (block.timestamp >= t.expiry) revert WrongExpiry();
        uint256 price = t.amount * t.priceTinybars; // Checked at admission; Hedera EVM value is tinybars.
        if (msg.value != price) revert WrongPayment();
        _checkHold(t);
        state[id] = State.Settled;
        (bool ok, bytes32 partition) = IHoldByPartition(ASSET).executeHoldByPartition(_key(t), t.buyer, t.amount);
        if (!ok || partition != PARTITION) revert DeliveryFailed();
        (bool paid,) = payable(t.seller).call{value: price}("");
        if (!paid) revert PaymentFailed();
        emit Settled(id, t.seller, t.buyer, t.amount, price, t.holdId);
    }
    function cancel(bytes32 id) external nonReentrant { _return(id, false); }
    function reclaim(bytes32 id) external nonReentrant { _return(id, true); }
    function _return(bytes32 id, bool expired) private {
        Terms memory t = _ready(id);
        if (msg.sender != t.seller) revert WrongAccount();
        if ((block.timestamp >= t.expiry) != expired) revert WrongExpiry();
        _checkHold(t);
        state[id] = expired ? State.Reclaimed : State.Cancelled;
        _release(t, expired);
        emit Returned(id, t.seller, t.holdId, t.amount, expired);
    }
    /// @notice Recover a Hold created for this escrow before terms were registered.
    function recoverOrphan(uint256 holdId) external nonReentrant {
        if (msg.sender != ACCOUNT_A && msg.sender != ACCOUNT_B) revert WrongAccount();
        bytes32 key = keccak256(abi.encode(msg.sender, holdId));
        if (holdId == 0 || usedHold[key]) revert Closed();
        IHoldTypes.HoldIdentifier memory h = IHoldTypes.HoldIdentifier(PARTITION, msg.sender, holdId);
        (uint256 amount, uint256 expiry, address escrow,,,,) = IHoldByPartition(ASSET).getHoldForByPartition(h);
        if (escrow != address(this) || amount == 0) revert WrongHold();
        usedHold[key] = true;
        bool expired = block.timestamp >= expiry;
        bool ok = expired ? IHoldByPartition(ASSET).reclaimHoldByPartition(h) : IHoldByPartition(ASSET).releaseHoldByPartition(h, amount);
        if (!ok) revert DeliveryFailed();
        emit Returned(bytes32(0), msg.sender, holdId, amount, expired);
    }
    function _ready(bytes32 id) private view returns (Terms memory) {
        if (state[id] != State.Ready) revert Closed();
        return terms[id];
    }
    function _key(Terms memory t) private pure returns (IHoldTypes.HoldIdentifier memory) {
        return IHoldTypes.HoldIdentifier(PARTITION, t.seller, t.holdId);
    }
    function _release(Terms memory t, bool expired) private {
        bool ok = expired ? IHoldByPartition(ASSET).reclaimHoldByPartition(_key(t)) : IHoldByPartition(ASSET).releaseHoldByPartition(_key(t), t.amount);
        if (!ok) revert DeliveryFailed();
    }
    function _checkHold(Terms memory t) private view {
        (uint256 amount, uint256 expiry, address escrow, address to, bytes memory data, bytes memory operatorData, ThirdPartyType kind) =
            IHoldByPartition(ASSET).getHoldForByPartition(_key(t));
        if (t.holdId == 0 || amount != t.amount || expiry != t.expiry || escrow != address(this) || to != t.buyer
            || data.length != 0 || operatorData.length != 0 || kind != ThirdPartyType.NULL) revert WrongHold();
    }
}
