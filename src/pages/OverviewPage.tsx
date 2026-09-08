import NovaAssetSummary from '../components/NovaAssetSummary';
import AssetLifecycle from '../components/AssetLifecycle';

export default function OverviewPage({ visible }: { visible: boolean }) {
  return <section id="overview" hidden={!visible} aria-labelledby="overview-heading" className="page-section hb:pb-10">
    <NovaAssetSummary/>
    <AssetLifecycle/>
    <section aria-labelledby="roles-heading" className="hb:mt-10">
      <h2 id="roles-heading" className="hb:text-2xl!">Who does what?</h2>
      <div className="hb:grid hb:gap-6 hb:md:grid-cols-3 hb:mt-4">
        <div><h3 className="hb:text-purple-900">Admin</h3><p>Sets up the demo asset and test credentials, and inspects settlement. The trading controls are view-only for Admin.</p></div>
        <div><h3 className="hb:text-amber-900">Seller account</h3><p>One of the two trading accounts. Can place buy or sell orders. When selling a match, locks NOVA and confirms the terms.</p></div>
        <div><h3 className="hb:text-blue-900">Buyer account</h3><p>The other trading account. Can also buy or sell. When buying a match, reviews and pays the exact HBAR amount.</p></div>
      </div>
      <p className="hb:mt-4! hb:text-sm hb:text-[#485d6b]">Header colors identify the connected account. Buying or selling is determined separately for each match. Every signature and transaction is approved manually in MetaMask.</p>
    </section>
    <section aria-labelledby="tabs-heading" className="hb:mt-10">
      <h2 id="tabs-heading" className="hb:text-2xl!">Find your next step</h2>
      <dl><div><dt><a href="#overview">Overview</a></dt><dd>Understand NOVA, the people and the flow.</dd></div><div><dt><a href="#market">Market</a></dt><dd>Place orders, select a match and settle it.</dd></div><div><dt><a href="#activity">Activity</a></dt><dd>Inspect your orders, matches and dated asset evidence.</dd></div><div><dt><a href="#settings">Settings</a></dt><dd>Check your account, network and setup.</dd></div></dl>
    </section>
  </section>;
}
