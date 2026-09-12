// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;
import {NovaSettlement,IHoldTypes,ThirdPartyType} from "../NovaSettlement.sol";
import {Vm,RefuseHbar} from "./NovaHbarSwap.t.sol";

// Explicit local ATS boundary double; no fork, signer or real KYC assertion.
contract SettlementHoldFixture {
    mapping(bytes32 => IHoldTypes.Hold) private holds;
    mapping(address => uint256) public delivered;
    mapping(address => uint256) public returned;
    uint256 public fault;
    bytes public reentry;
    bool public rejected;
    function reset(address a,address b) external { delivered[a]=0;delivered[b]=0;returned[a]=0;returned[b]=0;fault=0;delete reentry;rejected=false; }
    function put(address owner,uint256 id,IHoldTypes.Hold memory h) external { holds[keccak256(abi.encode(owner,id))]=h; }
    function setFault(uint256 f) external { fault=f; }
    function setReentry(bytes memory data) external { reentry=data; }
    function getHoldForByPartition(IHoldTypes.HoldIdentifier calldata k) external view returns(uint256,uint256,address,address,bytes memory,bytes memory,ThirdPartyType){
        require(k.partition==bytes32(uint256(1)));
        IHoldTypes.Hold memory h=holds[keccak256(abi.encode(k.tokenHolder,k.holdId))];
        return(h.amount,h.expirationTimestamp,h.escrow,h.to,h.data,fault==5?bytes(hex"01"):bytes(hex""),fault==6?ThirdPartyType.AUTHORIZED:ThirdPartyType.NULL);
    }
    function executeHoldByPartition(IHoldTypes.HoldIdentifier calldata k,address to,uint256 amount) external returns(bool,bytes32){
        IHoldTypes.Hold storage h=holds[keccak256(abi.encode(k.tokenHolder,k.holdId))];
        require(msg.sender==h.escrow && to==h.to && block.timestamp<h.expirationTimestamp && fault!=1,"KYC/delivery rejected");
        h.amount-=amount;delivered[to]+=amount;
        if(reentry.length>0){(bool ok,)=msg.sender.call(reentry);rejected=!ok;require(rejected);}
        return(fault!=2,fault==3?bytes32(0):k.partition);
    }
    function releaseHoldByPartition(IHoldTypes.HoldIdentifier calldata k,uint256 amount) external returns(bool){
        IHoldTypes.Hold storage h=holds[keccak256(abi.encode(k.tokenHolder,k.holdId))];
        require(msg.sender==h.escrow && block.timestamp<h.expirationTimestamp);h.amount-=amount;returned[k.tokenHolder]+=amount;return fault!=2;
    }
    function reclaimHoldByPartition(IHoldTypes.HoldIdentifier calldata k) external returns(bool){
        IHoldTypes.Hold storage h=holds[keccak256(abi.encode(k.tokenHolder,k.holdId))];
        require(block.timestamp>=h.expirationTimestamp);returned[k.tokenHolder]+=h.amount;h.amount=0;return fault!=2;
    }
}
contract SettlementReentrySeller {
    address public target; bytes public attack; bool public rejected;
    function init(address t,bytes calldata a) external {target=t;attack=a;}
    receive() external payable { (bool ok,)=target.call(attack);rejected=!ok;require(rejected); }
}
interface StorageVm { function store(address,bytes32,bytes32) external; }
contract NovaSettlementTest {
    Vm constant vm=Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    NovaSettlement s; SettlementHoldFixture token; NovaSettlement.Terms t; bytes32 id;
    function setUp() public {
        vm.chainId(296);vm.warp(1788832446);vm.prank(0xfd8FDb4989a916c6F2420a2116C356E34c889840);
        s=new NovaSettlement(bytes32(uint256(7)));
        vm.etch(s.ASSET(),type(SettlementHoldFixture).runtimeCode);token=SettlementHoldFixture(s.ASSET());
        token.reset(s.ACCOUNT_A(),s.ACCOUNT_B());
        t=NovaSettlement.Terms(bytes32(uint256(1)),bytes32(uint256(2)),bytes32(uint256(3)),s.ACCOUNT_A(),s.ACCOUNT_B(),2,10000000,block.timestamp,block.timestamp+1800,17);
        put(t);vm.deal(t.buyer,1000000000);vm.deal(t.seller,1000000000);
    }
    function put(NovaSettlement.Terms memory a) internal {token.put(a.seller,a.holdId,IHoldTypes.Hold(a.amount,a.expiry,address(s),a.buyer,""));}
    function register() internal {vm.prank(t.seller);id=s.register(t);}
    function buy() internal {vm.prank(t.buyer);s.settle{value:t.amount*t.priceTinybars}(id);}
    function testNormalAndReverse() public {
        register();buy();require(s.state(id)==NovaSettlement.State.Settled && token.delivered(t.buyer)==2 && t.seller.balance==1020000000 && address(s).balance==0);
        setUp();t.seller=s.ACCOUNT_B();t.buyer=s.ACCOUNT_A();t.amount=1;t.priceTinybars=9000000;put(t);register();buy();require(token.delivered(t.buyer)==1);
    }
    function testRegistrationTermsAndFullHold() public {
        for(uint256 i;i<9;i++){
            setUp();
            if(i==0)t.amount=0;if(i==1)t.priceTinybars=type(uint256).max;if(i==2)t.buyer=t.seller;
            if(i==3)t.sellerOrder=t.buyerOrder;if(i==4)t.expiry++;if(i==5)t.holdId=0;
            if(i==6)t.amount++;if(i==7)token.setFault(5);if(i==8)token.setFault(6);
            vm.prank(t.seller);(bool ok,)=address(s).call(abi.encodeCall(s.register,(t)));require(!ok);
        }
    }
    function testCorruptHoldFields() public {
        for(uint256 i;i<5;i++){setUp();IHoldTypes.Hold memory h=IHoldTypes.Hold(t.amount,t.expiry,address(s),t.buyer,"");
            if(i==0)h.amount++;if(i==1)h.expirationTimestamp++;if(i==2)h.escrow=address(1);if(i==3)h.to=address(1);if(i==4)h.data=hex"01";
            token.put(t.seller,t.holdId,h);vm.prank(t.seller);vm.expectRevert(NovaSettlement.WrongHold.selector);s.register(t);
        }
    }
    function testWrongAccountAndPayment() public {
        vm.prank(t.buyer);vm.expectRevert(NovaSettlement.WrongAccount.selector);s.register(t);register();
        vm.prank(t.seller);vm.expectRevert(NovaSettlement.WrongAccount.selector);s.settle(id);
        for(uint256 i;i<2;i++){vm.prank(t.buyer);vm.expectRevert(NovaSettlement.WrongPayment.selector);s.settle{value:19999999+2*i}(id);}
    }
    function testDuplicateMatchAndHold() public {
        register();vm.prank(t.seller);vm.expectRevert(NovaSettlement.Closed.selector);s.register(t);
        t.matchId=bytes32(uint256(9));vm.prank(t.seller);vm.expectRevert(NovaSettlement.Closed.selector);s.register(t);
        buy();vm.prank(t.buyer);vm.expectRevert(NovaSettlement.Closed.selector);s.settle{value:20000000}(id);
    }
    function testCancelWinsAndPayWins() public {
        register();vm.prank(t.seller);s.cancel(id);vm.prank(t.buyer);vm.expectRevert(NovaSettlement.Closed.selector);s.settle{value:20000000}(id);require(token.returned(t.seller)==2);
        setUp();register();buy();vm.prank(t.seller);vm.expectRevert(NovaSettlement.Closed.selector);s.cancel(id);
    }
    function testExpiryEqualityAndLastSecond() public {
        register();vm.warp(t.expiry-1);buy();setUp();register();vm.warp(t.expiry);
        vm.prank(t.buyer);vm.expectRevert(NovaSettlement.WrongExpiry.selector);s.settle{value:20000000}(id);
        require(s.state(id)==NovaSettlement.State.Ready && token.returned(t.seller)==0);
        vm.prank(t.seller);s.reclaim(id);require(token.returned(t.seller)==2);
    }
    function testOrphanBeforeAndAfterExpiry() public {
        vm.prank(t.seller);s.recoverOrphan(t.holdId);require(token.returned(t.seller)==2);
        vm.prank(t.seller);vm.expectRevert(NovaSettlement.Closed.selector);s.register(t);
        setUp();vm.warp(t.expiry);vm.prank(t.seller);s.recoverOrphan(t.holdId);require(token.returned(t.seller)==2);
    }
    function testWrongReturnAccountAndEarlyReclaim() public {
        register();vm.prank(t.buyer);vm.expectRevert(NovaSettlement.WrongAccount.selector);s.cancel(id);
        vm.prank(t.seller);vm.expectRevert(NovaSettlement.WrongExpiry.selector);s.reclaim(id);
        vm.prank(s.ADMIN());vm.expectRevert(NovaSettlement.WrongAccount.selector);s.recoverOrphan(17);
    }
    function testKycAndDeliveryFailureRollback() public {
        register();for(uint256 f=1;f<=3;f++){token.setFault(f);vm.prank(t.buyer);(bool ok,)=address(s).call{value:20000000}(abi.encodeCall(s.settle,(id)));
            require(!ok && token.delivered(t.buyer)==0 && s.state(id)==NovaSettlement.State.Ready && address(s).balance==0 && t.buyer.balance==1000000000);}
    }
    function testPaymentFailureRollsBackNOVA() public {
        register();vm.etch(t.seller,type(RefuseHbar).runtimeCode);vm.prank(t.buyer);vm.expectRevert(NovaSettlement.PaymentFailed.selector);s.settle{value:20000000}(id);
        require(token.delivered(t.buyer)==0 && s.state(id)==NovaSettlement.State.Ready);
    }
    function testCrossMatchAndTokenReentry() public {
        register();NovaSettlement.Terms memory other=t;other.matchId=bytes32(uint256(20));other.holdId=18;put(other);
        vm.prank(t.seller);bytes32 second=s.register(other);
        vm.etch(t.seller,type(SettlementReentrySeller).runtimeCode);SettlementReentrySeller(payable(t.seller)).init(address(s),abi.encodeCall(s.cancel,(second)));
        token.setReentry(abi.encodeCall(s.register,(other)));buy();require(token.rejected() && SettlementReentrySeller(payable(t.seller)).rejected());
        require(s.state(second)==NovaSettlement.State.Ready);
    }
    function testReturnFailureRollback() public {
        register();token.setFault(2);vm.prank(t.seller);vm.expectRevert(NovaSettlement.DeliveryFailed.selector);s.cancel(id);require(token.returned(t.seller)==0 && s.state(id)==NovaSettlement.State.Ready);
    }
    function testPublicDigestVector() public {
        address target=0x1111111111111111111111111111111111111111;
        vm.etch(target,address(s).code);
        // ReentrancyGuard uses its namespaced slot; marketSalt is the first ordinary storage slot.
        StorageVm(address(vm)).store(target,bytes32(0),bytes32(uint256(7)));
        t.matchId=keccak256(bytes("13-1"));t.sellerOrder=bytes32(uint256(0x2222222222222222222222222222222222222222222222222222222222222222));
        t.buyerOrder=bytes32(uint256(0x3333333333333333333333333333333333333333333333333333333333333333));
        require(NovaSettlement(target).digest(t)==0xf56593da2943ba675c309a6ac8df8e89a5e0122ecf9c3d472fc62491920ca1ad);
    }
    function testConstructor() public {
        vm.expectRevert(NovaSettlement.WrongAccount.selector);new NovaSettlement(bytes32(uint256(1)));
        vm.chainId(1);vm.expectRevert(NovaSettlement.Invalid.selector);new NovaSettlement(bytes32(uint256(1)));
    }
}
