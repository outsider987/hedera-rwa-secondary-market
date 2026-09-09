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
