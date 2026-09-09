import {useState} from 'react';
import snapshot from '../data/showcase.json';
import {creationHash} from '../lib/lifecycle';

const report = 'https://github.com/outsider987/hedera-rwa-secondary-market/blob/f5573a699da1c687d9b4388a8c54639c96a308c5/docs/evidence/';
const issuance = [
  {label:'Asset setup', title:'A share, defined with ATS.', copy:'Admin created NOVA through the ATS SDK and manually approved the transaction in MetaMask. Whole shares, a maximum supply of 1,000, and internal KYC were configured.', fact:'0 initial supply / 1,000 maximum', hash:creationHash, block:'40209377'},
  {label:'Test credential', title:'A credential for the seller.', copy:'Admin signed a synthetic Seller credential. Signature verification is separate from granting on-chain KYC. No real identity check was performed.', fact:'Admin signs · Seller is the subject', hash:'', block:''},
  {label:'KYC grant', title:'Eligibility, recorded on chain.', copy:'After credential verification, Admin manually approved the ATS KYC grant. This historical record established Seller eligibility for NOVA at that time.', fact:'Seller KYC granted · Synthetic data', hash:'0xb74802329031a287415455c470d02b0ea777d0f8ec4fc751a406345a1db67b10', block:'40222969'},
  {label:'Issuance', title:'100 NOVA reach the seller.', copy:'Admin issued 100 whole shares to the eligible Seller. This issuance is complete; these controls replay its explanation, not its transaction.', fact:'Seller 100 NOVA · Total supply 100 / 1,000', hash:'0x6b9b42184a7d9490a34692c44b1b9e8f03a26d90e87bb451f64f06db26c05a5a', block:'40223460'},
];
const tradeCopy: Record<string, [string,string,string]> = {
  matched:['An agreement. Assets stay put.','The order book matched the quantity and price. Matching reserved neither NOVA nor HBAR.','Buyer + Seller · Order intent'],
  lock:['NOVA enters an ATS Hold.','The seller manually locked the matched shares. HBAR stayed with the buyer.','Seller · Lock shares'],
  register:['The exact terms are registered.','A separate seller transaction bound the Hold to this match. The buyer had not paid.','Seller · Register Hold'],
  expired:['Time is up. NOVA is still held.','Expiry stops payment; it does not return shares. A separate reclaim transaction is required. This is an explanation of the interval before the recorded reclaim.','Seller · Reclaim required'],
  settle:['One transaction. Both sides delivered.','The verified buyer payment delivered NOVA to the buyer and HBAR principal to the seller atomically. Network fees are separate.','Buyer · Pay and receive'],
  cancel:['Cancelled. Shares returned.','The verified seller cancellation returned NOVA from the Hold. No HBAR principal was paid.','Seller · Cancel settlement'],
  reclaim:['Reclaimed. Shares returned.','After expiry, the seller manually reclaimed the Hold. This verified transaction returned NOVA; no HBAR principal was paid.','Seller · Reclaim expired Hold'],
};

export default function NovaStory() {
  const [chapter,setChapter]=useState<'issue'|'trade'>('issue');
  const [caseId,setCaseId]=useState('normal');
  const [step,setStep]=useState(0);
  const [keyboard,setKeyboard]=useState(false);
  const selected=snapshot.cases.find(item=>item.id===caseId)!;
  const steps=chapter==='issue'?issuance.map(item=>item.label):['matched','lock','register',...(caseId==='reclaim'?['expired']:[]),selected.timeline[2].action];
  const action=steps[step];
  const issuing=chapter==='issue';
  const event=issuing?undefined:selected.timeline.find(item=>item.action===action);
  const issued=issuing&&step===3;
  const delivered=!issuing&&action==='settle';
  const held=!issuing&&['lock','register','expired'].includes(action);
  const returned=!issuing&&['cancel','reclaim'].includes(action);
  const position=issuing?(issued?2:1):held?1:delivered?2:0;
  const title=issuing?issuance[step].title:tradeCopy[action][0];
  const copy=issuing?issuance[step].copy:tradeCopy[action][1];
  const hash=issuing?issuance[step].hash:event?.hash;
  const block=issuing?issuance[step].block:event?.block;
  const balances=event?.after ?? (action==='expired'?selected.timeline[1].after:selected.timeline[0].before);
  const total=(BigInt(selected.quantity)*BigInt(selected.unitPriceHBAR.replace('.',''))).toString().padStart(3,'0');
  const payment=`${total.slice(0,-2)}.${total.slice(-2)}`;
  const selectChapter=(value:'issue'|'trade')=>{setChapter(value);setStep(0);};
  return <section className="nova-story" aria-labelledby="flow-heading" data-keyboard={keyboard}
    onPointerDownCapture={()=>setKeyboard(false)} onKeyDownCapture={()=>setKeyboard(true)}>
    <div className="story-heading"><div><h2 id="flow-heading">What happens to a share?</h2>
      <p>Recorded Testnet run · Animated explanation of recorded steps · No transaction</p></div>
      <div className="story-chapters" aria-label="Story chapters">
        <button type="button" aria-pressed={issuing} className={issuing?'':'secondary'} onClick={()=>selectChapter('issue')}>1. Create NOVA</button>
        <button type="button" aria-pressed={!issuing} className={!issuing?'':'secondary'} onClick={()=>selectChapter('trade')}>2. Trade NOVA</button>
      </div>
    </div>
    {!issuing&&<label className="story-case">Recorded case <select value={caseId} onChange={e=>{setCaseId(e.target.value);setStep(0);}}>
      {snapshot.cases.map(item=><option key={item.id} value={item.id}>{item.title} · Match {item.matchId}</option>)}
    </select><span>September 8, 2026 · {selected.quantity} NOVA at {selected.unitPriceHBAR} HBAR / share</span></label>}
    <div className="story-steps" aria-label="Story steps">{steps.map((label,index)=><button type="button" key={label} aria-pressed={step===index} onClick={()=>setStep(index)} className={step===index?'':'secondary'}><span>{index+1}</span>{label==='matched'?'Matched':label==='lock'?'Locked':label==='register'?'Registered':label==='expired'?'Expired':label==='settle'?'Settled':label==='cancel'?'Cancelled':label==='reclaim'?'Reclaimed':label}</button>)}</div>
    <div className="story-body">
      <div className="story-scene" key={chapter+caseId} data-position={position} data-held={held} data-issued={issued} data-issuing={issuing}>
        <div className="story-scene-caption">{issuing?'Hedera Asset Tokenization Studio':`Match ${selected.matchId} · Hold ${selected.holdId}`}</div>
        <div className="story-stage" aria-hidden="true">
          <svg className="story-track" viewBox="0 0 600 100" preserveAspectRatio="none"><path d="M 100 50 H 500"/><path className="story-track-progress" d="M 100 50 H 500" style={{transform:`scaleX(${issuing?step/3:step/(steps.length-1)})`}}/></svg>
          <div className="story-hold" style={{opacity:held?1:0}}><svg viewBox="0 0 32 32"><rect x="7" y="14" width="18" height="14" rx="2"/><path d="M 11 14 V 9 A 5 5 0 0 1 21 9 V 14"/></svg><span>Locked</span></div>
          <div className="story-certificate" style={{transform:`translateX(${position*100}%)`}}>
            {issuing&&<img className="story-certificate-copy" src={import.meta.env.BASE_URL+'assets/nova-demo-equity.png'} alt="" width="1536" height="1024" style={{opacity:issued?1:0,transform:issued?'translate(-5%, -7%) rotate(-4deg)':'translate(0, 0) rotate(0deg)'}}/>}
            <img className="story-certificate-front" src={import.meta.env.BASE_URL+'assets/nova-demo-equity.png'} alt="" width="1536" height="1024" style={{transform:`scale(${issuing&&!issued?1.65:1})`}}/>
            <strong>{issuing?(issued?'100 NOVA':'NOVA'):selected.quantity+' NOVA'}</strong>
          </div>
          {issuing&&<div className="story-credential" style={{opacity:step>=1?1:0,transform:`translateX(${step>=2?100:0}%)`}}><span>{step>=2?'KYC grant recorded':'Synthetic VC signed'}</span></div>}
          {!issuing&&<div className="story-payment" style={{transform:`translateX(${delivered?0:200}%)`}}><span>{payment} HBAR</span></div>}
        </div>
        <div className="story-stations" aria-hidden="true">{(issuing?['Admin','ATS asset','Seller']:[`${selected.sellerAccount} · Selling`,'ATS Hold',`${selected.buyerAccount} · Buying`]).map(label=><span key={label}>{label}</span>)}</div>
        {issuing?<div className="story-fact">{issuance[step].fact}</div>:<div className="story-fact">{selected.quantity} NOVA · {held?'Locked in ATS Hold':delivered?'Delivered to buyer':returned?'Returned to seller':'With seller · Not reserved'}<br/>{payment} HBAR principal · {delivered?'Paid to seller':'Not paid'}</div>}
        <p className="story-disclosure">{issuing?'Fictional equity · Synthetic KYC · September 7, 2026.':'Historical amounts, not current balances.'} Certificate artwork is illustrative.</p>
      </div>
      <div className="story-explanation" aria-live="polite" aria-atomic="true">
        <h3>{title}</h3><p>{copy}</p>
        <p className="story-actor">{issuing?(step===0?'Admin · Create asset':step===1?'Admin · Sign test VC':step===2?'Admin · Grant KYC':'Admin · Issue shares'):tradeCopy[action][2]}</p>
        {!issuing&&<dl><div><dt>Selling account · available / held</dt><dd>{balances.sellerAvailable} / {balances.sellerHeld} NOVA</dd></div><div><dt>Buying account · available / held</dt><dd>{balances.buyerAvailable} / {balances.buyerHeld} NOVA</dd></div></dl>}
        {hash?<a className="story-proof" href={'https://hashscan.io/testnet/transaction/'+hash} target="_blank" rel="noreferrer">View transaction · Block {block} ↗</a>:<p className="story-no-tx">{issuing?'Off-chain credential signature · No transaction ID':action==='expired'?'Expiry is not a transaction. Amounts retain the last registered snapshot.':'Off-chain match · No settlement transaction yet'}</p>}
        <a className="story-report" href={report+(issuing?(step===0?'024-vc-nova-manual.md':'027-t03-manual.md'):'038-t08-manual.md')} target="_blank" rel="noreferrer">Read recorded evidence ↗</a>
      </div>
    </div>
    <div className="story-controls"><button type="button" className="secondary" disabled={step===0} onClick={()=>setStep(step-1)}>Previous step</button><span>Step {step+1} of {steps.length} · Click to advance, pause to explain</span>{step===steps.length-1&&issuing?<button type="button" onClick={()=>selectChapter('trade')}>Continue to trading</button>:<button type="button" disabled={step===steps.length-1} onClick={()=>setStep(step+1)}>Next step</button>}</div>
  </section>;
}
