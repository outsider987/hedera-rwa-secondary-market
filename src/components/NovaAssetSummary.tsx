import { securityId } from '../lib/lifecycle';

export default function NovaAssetSummary() {
  return <div className="hb:grid hb:items-center hb:gap-8 hb:lg:grid-cols-2">
    <div>
      <h2 id="overview-heading" className="hb:text-4xl! hb:mb-4!">Meet NOVA.</h2>
      <p className="hb:text-xl hb:font-semibold">A fictional company. Digital common shares.</p>
      <p className="hb:mt-4!">NOVA represents demo equity on Hedera Testnet. Follow a share from issuance to a seller, through a matched order, to a buyer.</p>
      <dl>
        <div><dt>Asset</dt><dd>Nova Private Equity Common Shares</dd></div>
        <div><dt>Trading pair</dt><dd>NOVA / HBAR</dd></div>
        <div><dt>Unit</dt><dd>1 NOVA · one whole demo share</dd></div>
        <div><dt>Network / asset ID</dt><dd>Testnet 296 · {securityId}</dd></div>
      </dl>
      <p className="hb:text-sm hb:text-[#485d6b]">Synthetic asset and KYC. No real company ownership or asset backing is represented.</p>
      <div className="actions"><a className="hb:inline-flex hb:items-center hb:min-h-11 hb:rounded hb:bg-[#155781] hb:px-4 hb:py-2 hb:font-semibold hb:text-white! hb:no-underline hb:hover:bg-[#0a3652]" href="#market">Open market</a><a className="hb:inline-flex hb:items-center hb:min-h-11 hb:px-2" href="#settings">Set up accounts</a></div>
    </div>
    <figure className="hb:m-0">
      <img src="/assets/nova-demo-equity.png" alt="Illustrative NOVA certificate labeled Demo Equity and Hedera Testnet" width="1536" height="1024" className="hb:block hb:w-full hb:h-auto"/>
      <figcaption className="hb:mt-3 hb:text-sm hb:text-[#485d6b]">Concept illustration · not a certificate of ownership.</figcaption>
    </figure>
  </div>;
}
