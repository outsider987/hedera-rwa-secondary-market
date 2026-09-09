import {useState} from 'react';

/** Position describes the last verified NOVA location, never a pending operation. */
export default function NovaFlow({status,quantity,total,minting=false}: {status:string;quantity:string;total:string;minting?:boolean}) {
  const delivered=status==='Settled';
  const held=['Locked','Ready','Expired · Reclaim required'].includes(status);
  const position=delivered?2:held?1:0;
  return <div className="nova-flow" data-position={position}>
    <div className="nova-flow-track" aria-hidden="true">
      <div className="nova-flow-carrier" style={{transform:`translateX(${position*100}%)`}}>
        <img className={minting?'nova-minting':''} src={import.meta.env.BASE_URL+'assets/nova-demo-equity.png'} alt="" width="1536" height="1024"/>
      </div>
      <div className="nova-flow-payment" style={{transform:`translateX(${delivered?0:200}%)`}}><span>HBAR</span></div>
    </div>
    <div className="nova-flow-stations" aria-hidden="true"><span>Selling account</span><span>ATS Hold</span><span>Buying account</span></div>
    <p className="hb:text-sm! hb:mb-0!">{quantity} NOVA · {minting?'Illustrative issuance in progress':held?'Locked in ATS Hold':delivered?'Delivered to buying account':status==='Unprepared'?'Not locked · Balance not confirmed':'Returned to selling account'}<br/>{total} HBAR · {delivered?'Paid to selling account':'Not paid · Buyer payment required'}</p>
  </div>;
}

const examples=[
  ['Minting','Unprepared','Admin issues demo shares. Illustration only; historical issuance is already complete.'],
  ['Matched','Unprepared','Buyer and seller matched 1 NOVA at 0.1 HBAR. Neither asset is reserved.'],
  ['Locked','Locked','Seller locked NOVA. Seller must still confirm the exact match terms.'],
  ['Confirmed','Ready','Seller confirmed the terms. Buyer can review payment; HBAR has not moved.'],
  ['Delivered','Settled','Verified payment: 0.1 HBAR to seller and 1 NOVA to buyer together.'],
  ['Returned','Reclaimed','Alternative outcome: a verified cancellation or reclaim returns NOVA. Buyer did not pay.'],
];
export function NovaFlowDemo() {
  const [step,setStep]=useState(1);
  return <div className="hb:mt-6 hb:max-w-2xl">
    <p className="hb:font-semibold">Try the flow · Illustration only · No transaction</p>
    <div className="hb:flex hb:flex-wrap hb:gap-2" aria-label="Illustrated lifecycle stages">
      {examples.map(([label],index)=><button key={label} className={step===index?'':'secondary'} aria-pressed={step===index} onClick={()=>setStep(index)}>{label}</button>)}
    </div>
    <NovaFlow status={examples[step][1]} quantity="1" total="0.1" minting={step===0}/>
    <p role="status">{examples[step][2]}</p>
  </div>;
}
