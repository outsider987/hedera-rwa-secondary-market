import {useRef,useState} from 'react';
import {accounts,securityId,securityAddress,partition,type LifecycleState} from '../lib/lifecycle';
import {readHoldState} from '../lib/hold';
import {assertTradeState,readSwap} from '../lib/trade';

export function Balances({state}:{state:LifecycleState}) {
 return <dl className="balance-list"><div><dt>Seller available / held</dt><dd>{state.sellerBalance} / {state.sellerHeld} NOVA</dd></div><div><dt>Buyer available / held</dt><dd>{state.buyerBalance} / {state.buyerHeld} NOVA</dd></div><div><dt>Supply / cap</dt><dd>{state.supply} / 1,000 NOVA</dd></div></dl>;
}
export default function TradePanel() {
 const [state,setState]=useState<LifecycleState>(),[working,setWorking]=useState(false),[problem,setProblem]=useState('');
 const running=useRef(false);
 async function verify(){if(running.current)return;running.current=true;setWorking(true);setProblem('');try{
  const signal=AbortSignal.timeout(180000),block='40247352';
  const input={securityId,securityAddress,partition,holder:accounts.Seller.address,destination:accounts.Buyer.address,escrow:'0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158',baseBlock:'40245635',baseTimestamp:'1788837501',expirationTimestamp:'1788923901',holdId:'2'};
  const value=await readHoldState(signal,'0x'+BigInt(block).toString(16));assertTradeState(value,input,'settled',false);
  if(await readSwap(input,block,signal)!==1)throw new Error('Historical settlement state differs.');setState(value);
 }catch{setProblem('Historical verification unavailable. The dated acceptance report remains available; no current balance is inferred.');}finally{running.current=false;setWorking(false);}}
 return <section className="trade-layout" aria-labelledby="trade-heading"><div className="trade-main"><h2 id="trade-heading">Completed fixed trade</h2><p>10 NOVA delivered for 1 HBAR · September 8, 2026</p><p>This is T05 history at block 40247352. New orders and per-match settlement are in <a href="#market">Market</a>.</p><button className="secondary" disabled={working} onClick={verify}>{working?'Verifying historical block…':'Verify historical T05 state'}</button>{problem&&<p role="alert">{problem}</p>}{state&&<><p role="status">Historical balances, fixed runtime and Settled state verified at block {state.block}.</p><Balances state={state}/></>}<p><a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/evidence/032-t05-manual.md" target="_blank" rel="noreferrer">Original acceptance report</a> · <a href="#history">Saved transaction history</a></p></div><aside className="trade-summary"><h3>Trade summary</h3><dl><div><dt>Delivered</dt><dd>10 NOVA</dd></div><div><dt>Seller principal</dt><dd>1 HBAR</dd></div><div><dt>Acceptance</dt><dd>Verified historical Testnet result</dd></div></dl><p>Historical Seller 84 / Buyer 16 NOVA; both held 0. These are dated results, not current balances.</p></aside></section>;
}
