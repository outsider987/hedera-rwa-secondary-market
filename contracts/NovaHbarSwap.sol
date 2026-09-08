// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.36;

// Published ATS 8.0.0 interfaces; upstream Apache-2.0 notices remain in the package.
import {IHoldByPartition} from "@hashgraph/asset-tokenization-contracts/contracts/facets/holdByPartition/IHoldByPartition.sol";
import {IHoldTypes} from "@hashgraph/asset-tokenization-contracts/contracts/facets/hold/IHoldTypes.sol";
import {ThirdPartyType} from "@hashgraph/asset-tokenization-contracts/contracts/domain/asset/types/ThirdPartyType.sol";

/// @notice One fixed, non-upgradeable Testnet trade. HBAR amounts inside Hedera EVM are tinybars.
contract NovaHbarSwap {
    address public constant ASSET = 0x261CE349dF182988FA25d00868cf6cF434220C24;
    address public constant SELLER = 0x740E4eF58151A169621622577a5B6D6FF5010836;
    address public constant BUYER = 0xa1f2872EE7A9f74523ae0887a9dc428Ff1340706;
    bytes32 public constant PARTITION = bytes32(uint256(1));
    uint256 public constant AMOUNT = 10;
    uint256 public constant PRICE_TINYBARS = 100_000_000;
    uint256 public immutable expiry;
    enum State { Open, Settled, Cancelled, Reclaimed }
    State public state;

    error WrongChain();
    error WrongAccount();
    error WrongPayment();
    error Closed();
    error WrongExpiry();
    error WrongHold();
    error DeliveryFailed();
    error PaymentFailed();

    event Settled(uint256 indexed holdId, address indexed seller, address indexed buyer, uint256 amount, uint256 tinybars);
    event Cancelled(uint256 indexed holdId);
    event Reclaimed(uint256 indexed holdId);
    event Setup(address indexed deployer, uint256 expiry);

    constructor(uint256 expirationTimestamp) {
        if (block.chainid != 296) revert WrongChain();
        if (expirationTimestamp <= block.timestamp || expirationTimestamp > block.timestamp + 86400) revert WrongExpiry();
        expiry = expirationTimestamp;
        emit Setup(msg.sender, expirationTimestamp);
    }

    function settle(uint256 holdId) external payable {
        if (msg.sender != BUYER) revert WrongAccount();
        if (msg.value != PRICE_TINYBARS) revert WrongPayment();
        _check(holdId, false);
        state = State.Settled;
        (bool delivered, bytes32 deliveredPartition) = IHoldByPartition(ASSET).executeHoldByPartition(_key(holdId), BUYER, AMOUNT);
        if (!delivered || deliveredPartition != PARTITION) revert DeliveryFailed();
        (bool paid,) = payable(SELLER).call{value: PRICE_TINYBARS}("");
        if (!paid) revert PaymentFailed();
        emit Settled(holdId, SELLER, BUYER, AMOUNT, PRICE_TINYBARS);
    }

    function cancel(uint256 holdId) external {
        if (msg.sender != SELLER) revert WrongAccount();
        _check(holdId, false);
        state = State.Cancelled;
        if (!IHoldByPartition(ASSET).releaseHoldByPartition(_key(holdId), AMOUNT)) revert DeliveryFailed();
        emit Cancelled(holdId);
    }

    function reclaim(uint256 holdId) external {
        if (msg.sender != SELLER) revert WrongAccount();
        _check(holdId, true);
        state = State.Reclaimed;
        if (!IHoldByPartition(ASSET).reclaimHoldByPartition(_key(holdId))) revert DeliveryFailed();
        emit Reclaimed(holdId);
    }

    function _key(uint256 holdId) private pure returns (IHoldTypes.HoldIdentifier memory) {
        return IHoldTypes.HoldIdentifier(PARTITION, SELLER, holdId);
    }

    function _check(uint256 holdId, bool expired) private view {
        if (state != State.Open) revert Closed();
        // Matches ATS 8.0.0: expiration is inclusive, including reclaim at equality.
        if ((block.timestamp >= expiry) != expired) revert WrongExpiry();
        (uint256 amount, uint256 expiration, address escrow, address destination,
            bytes memory data, bytes memory operatorData, ThirdPartyType thirdPartyType) =
            IHoldByPartition(ASSET).getHoldForByPartition(_key(holdId));
        if (holdId == 0 || amount != AMOUNT || expiration != expiry || escrow != address(this) || destination != BUYER
            || data.length != 0 || operatorData.length != 0 || thirdPartyType != ThirdPartyType.NULL) revert WrongHold();
    }
}
