import {hbar} from '../lib/market';
import snapshot from '../data/presentation.json';
const s=snapshot.swap;
export default function DemoProof(){return <section className="demo-proof" aria-label="Historical settlement proof">
 <p>September 8, 2026 · Hedera Testnet · Historical snapshot</p>
 <dl className="proof-blocks"><div><dt>Settlement block</dt><dd>{s.settlement.block}</dd></div><div><dt>Final verification block</dt><dd>{s.verificationBlock}</dd></div></dl>
 <table><caption>Recorded outcome · NOVA balances</caption><tbody>{Object.entries({'Seller available':s.settlement.after.sellerAvailable,'Buyer available':s.settlement.after.buyerAvailable,'Seller held':s.settlement.after.sellerHeld,'Buyer held':s.settlement.after.buyerHeld}).map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value} NOVA</td></tr>)}<tr><th scope="row">Seller received</th><td>{hbar(s.principalTinybars)} HBAR principal</td></tr></tbody></table>
 <p>Network fee: {hbar(s.feeTinybars)} HBAR, separate from the {hbar(s.principalTinybars)} HBAR principal.</p>
 <div className="demo-links"><a href={'https://hashscan.io/testnet/transaction/'+s.settlement.hash}>Settlement transaction</a><a href={snapshot.sourceBase+'038-t08-manual.md'}>Acceptance report</a><a href={'data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(snapshot,null,2))} download="holdbook-presentation.json">Download public evidence</a></div>
 </section>;}
