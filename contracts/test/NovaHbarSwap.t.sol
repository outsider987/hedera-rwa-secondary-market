// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {NovaHbarSwap, IHoldTypes, ThirdPartyType} from "../NovaHbarSwap.sol";

interface Vm {
    function chainId(uint256) external;
    function warp(uint256) external;
    function deal(address, uint256) external;
    function etch(address, bytes calldata) external;
    function prank(address) external;
    function expectRevert(bytes4) external;
}

// Local VM only. No private keys, RPC fork, broadcast, or signing fixtures.
contract HoldFixture {
    IHoldTypes.Hold public hold;
    bytes public operatorData;
    ThirdPartyType public kind;
    uint256 public sellerBalance;
    uint256 public buyerBalance;
    uint256 public held;
    uint256 public fault;
    bool public reentryRejected;
    function initialize(address swap, address buyer, uint256 expiry) external {
        hold = IHoldTypes.Hold(10, expiry, swap, buyer, "");
        operatorData = ""; kind = ThirdPartyType.NULL; fault = 0; reentryRejected = false;
        sellerBalance = 84; buyerBalance = 6; held = 10;
    }
    function corrupt(uint256 field) external {
        if (field == 0) hold.amount = 9;
        if (field == 1) hold.expirationTimestamp++;
        if (field == 2) hold.escrow = address(1);
        if (field == 3) hold.to = address(1);
        if (field == 4) hold.data = hex"01";
        if (field == 5) operatorData = hex"01";
        if (field == 6) kind = ThirdPartyType.AUTHORIZED;
    }
    function setFault(uint256 value) external { fault = value; }
    function getHoldForByPartition(IHoldTypes.HoldIdentifier calldata key) external view returns
        (uint256, uint256, address, address, bytes memory, bytes memory, ThirdPartyType) {
        require(key.partition == bytes32(uint256(1)) && key.tokenHolder == 0x740E4eF58151A169621622577a5B6D6FF5010836 && key.holdId == 17, "fixture key");
        return (hold.amount, hold.expirationTimestamp, hold.escrow, hold.to, hold.data, operatorData, kind);
    }
    function executeHoldByPartition(IHoldTypes.HoldIdentifier calldata, address to, uint256 amount) external returns (bool, bytes32) {
        require(msg.sender == hold.escrow && to == hold.to && amount == 10 && block.timestamp < hold.expirationTimestamp);
        held -= amount; buyerBalance += amount; hold.amount -= amount;
        if (fault == 1) revert("delivery fault");
        if (fault == 4) {
            (bool ok,) = msg.sender.call(abi.encodeCall(NovaHbarSwap.cancel, (17)));
            reentryRejected = !ok;
        }
        return (fault != 2, fault == 3 ? bytes32(0) : bytes32(uint256(1)));
    }
    function releaseHoldByPartition(IHoldTypes.HoldIdentifier calldata, uint256 amount) external returns (bool) {
        require(msg.sender == hold.escrow && block.timestamp < hold.expirationTimestamp);
        held -= amount; sellerBalance += amount; hold.amount -= amount;
        return fault != 2;
    }
    function reclaimHoldByPartition(IHoldTypes.HoldIdentifier calldata) external returns (bool) {
        require(block.timestamp >= hold.expirationTimestamp);
        sellerBalance += held; held = 0; hold.amount = 0;
        return fault != 2;
    }
}
contract RefuseHbar { receive() external payable { revert("payment fault"); } }
contract ReenterSeller {
    receive() external payable {
        (bool cancelled,) = msg.sender.call(abi.encodeCall(NovaHbarSwap.cancel, (17)));
        require(!cancelled, "cancel reentry succeeded");
        (bool reclaimed,) = msg.sender.call(abi.encodeCall(NovaHbarSwap.reclaim, (17)));
        require(!reclaimed, "reclaim reentry succeeded");
        (bool settled,) = msg.sender.call{value: msg.value}(abi.encodeCall(NovaHbarSwap.settle, (17)));
        require(!settled, "settle reentry succeeded");
    }
}

contract NovaHbarSwapTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    NovaHbarSwap swap;
    HoldFixture token;
    uint256 constant PRICE = 100_000_000; // Tinybars inside the Hedera EVM; the local VM does no RPC unit conversion.
    function setUp() public {
        vm.chainId(296); vm.warp(1_788_832_446);
        swap = new NovaHbarSwap(block.timestamp + 86400);
        vm.etch(swap.ASSET(), type(HoldFixture).runtimeCode);
        token = HoldFixture(swap.ASSET()); token.initialize(address(swap), swap.BUYER(), swap.expiry());
        vm.deal(swap.BUYER(), 10 * PRICE); vm.deal(swap.SELLER(), 0);
    }
    function buy() internal { vm.prank(swap.BUYER()); swap.settle{value: PRICE}(17); }
    function intact() internal view {
        require(swap.state() == NovaHbarSwap.State.Open && address(swap).balance == 0);
        require(token.sellerBalance() == 84 && token.buyerBalance() == 6 && token.held() == 10);
        require(swap.BUYER().balance == 10 * PRICE && swap.SELLER().balance == 0);
    }
    function failedBuy(uint256 value, uint256 id) internal {
        vm.prank(swap.BUYER()); (bool ok,) = address(swap).call{value: value}(abi.encodeCall(swap.settle, (id)));
        require(!ok); intact();
    }
    function testAtomicExchange() public {
        buy(); require(swap.state() == NovaHbarSwap.State.Settled);
        require(token.sellerBalance() == 84 && token.buyerBalance() == 16 && token.held() == 0);
        require(swap.SELLER().balance == PRICE && swap.BUYER().balance == 9 * PRICE && address(swap).balance == 0);
    }
    function testWrongBuyerAndAdmin() public {
        for (uint256 i; i < 2; i++) {
            address caller = i == 0 ? swap.SELLER() : 0xfd8FDb4989a916c6F2420a2116C356E34c889840;
            vm.prank(caller); (bool ok,) = address(swap).call(abi.encodeCall(swap.settle, (17))); require(!ok); intact();
        }
    }
    function testUnderAndOverPayment() public { failedBuy(PRICE - 1, 17); failedBuy(PRICE + 1, 17); }
    function testWrongHoldIds() public { failedBuy(PRICE, 0); failedBuy(PRICE, 18); }
    function testFullHoldBinding() public {
        for (uint256 i; i < 7; i++) { setUp(); token.corrupt(i); failedBuy(PRICE, 17); }
    }
    function testRepeatedSettlement() public {
        buy(); vm.prank(swap.BUYER()); vm.expectRevert(NovaHbarSwap.Closed.selector); swap.settle{value: PRICE}(17);
        require(swap.SELLER().balance == PRICE && token.buyerBalance() == 16);
    }
    function testExpiryEqualityAndAfter() public {
        vm.warp(swap.expiry()); failedBuy(PRICE, 17);
        vm.prank(swap.SELLER()); vm.expectRevert(NovaHbarSwap.WrongExpiry.selector); swap.cancel(17);
        vm.prank(swap.SELLER()); swap.reclaim(17);
        require(token.sellerBalance() == 94 && token.held() == 0 && swap.state() == NovaHbarSwap.State.Reclaimed);
        setUp(); vm.warp(swap.expiry() + 1); failedBuy(PRICE, 17); vm.prank(swap.SELLER()); swap.reclaim(17);
    }
    function testLastSecondPurchase() public { vm.warp(swap.expiry() - 1); buy(); }
    function testEarlyReclaimAndUnauthorizedRecovery() public {
        vm.prank(swap.SELLER()); vm.expectRevert(NovaHbarSwap.WrongExpiry.selector); swap.reclaim(17);
        vm.prank(swap.BUYER()); vm.expectRevert(NovaHbarSwap.WrongAccount.selector); swap.cancel(17);
        vm.warp(swap.expiry()); vm.prank(swap.BUYER()); vm.expectRevert(NovaHbarSwap.WrongAccount.selector); swap.reclaim(17); intact();
    }
    function testCancelWinsRace() public {
        vm.prank(swap.SELLER()); swap.cancel(17);
        vm.prank(swap.BUYER()); vm.expectRevert(NovaHbarSwap.Closed.selector); swap.settle{value: PRICE}(17);
        require(token.sellerBalance() == 94 && token.buyerBalance() == 6 && token.held() == 0);
    }
    function testPurchaseWinsRace() public {
        buy(); vm.prank(swap.SELLER()); vm.expectRevert(NovaHbarSwap.Closed.selector); swap.cancel(17);
        vm.warp(swap.expiry()); vm.prank(swap.SELLER()); vm.expectRevert(NovaHbarSwap.Closed.selector); swap.reclaim(17);
    }
    function testDeliveryRevertFalseAndWrongPartitionRollback() public {
        for (uint256 i = 1; i <= 3; i++) { token.setFault(i); failedBuy(PRICE, 17); }
    }
    function testPaymentFailureRollsBackDelivery() public {
        vm.etch(swap.SELLER(), type(RefuseHbar).runtimeCode); failedBuy(PRICE, 17);
    }
    function testSellerAndTokenReentrancy() public {
        vm.etch(swap.SELLER(), type(ReenterSeller).runtimeCode); token.setFault(4); buy();
        require(token.reentryRejected() && swap.SELLER().balance == PRICE && token.buyerBalance() == 16);
    }
    function testCancelAndReclaimFailureRollback() public {
        token.setFault(2); vm.prank(swap.SELLER()); vm.expectRevert(NovaHbarSwap.DeliveryFailed.selector); swap.cancel(17); intact();
        vm.warp(swap.expiry()); vm.prank(swap.SELLER()); vm.expectRevert(NovaHbarSwap.DeliveryFailed.selector); swap.reclaim(17); intact();
    }
    function testConstructorGuards() public {
        vm.expectRevert(NovaHbarSwap.WrongExpiry.selector); new NovaHbarSwap(block.timestamp);
        vm.expectRevert(NovaHbarSwap.WrongExpiry.selector); new NovaHbarSwap(block.timestamp + 86401);
        vm.chainId(1); vm.expectRevert(NovaHbarSwap.WrongChain.selector); new NovaHbarSwap(block.timestamp + 86400);
    }
}
