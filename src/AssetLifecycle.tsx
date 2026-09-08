export default function AssetLifecycle() {
  return <section aria-labelledby="flow-heading" className="hb:mt-12 hb:border-t hb:border-[#d4dfe7] hb:pt-8">
    <h2 id="flow-heading" className="hb:text-2xl!">What happens to a share?</h2>
    <p>NOVA is the share. HBAR is what the buyer pays. An order starts the conversation; settlement moves the assets.</p>
    <ol className="hb:list-none hb:p-0! hb:mt-6! hb:grid hb:gap-6 hb:md:grid-cols-3">
      {[
        ['Issue shares', 'Admin creates NOVA and issues demo shares to a verified test account. This setup is already complete.'],
        ['Place & match orders', 'A buyer and seller agree on quantity and price through matching. Orders reserve no NOVA or HBAR.'],
        ['Lock NOVA', 'The selling account manually locks the matched shares in an ATS Hold. The buyer has not paid yet.'],
        ['Confirm the match', 'The selling account signs a separate transaction to register the Hold with the exact match terms.'],
        ['Pay & deliver', 'The buying account pays HBAR. Payment and NOVA delivery succeed together in one transaction, or both revert.'],
        ['Verify the outcome', 'Check the transaction and balances. Cancellation or expiry requires a separate return transaction; expiry alone does not unlock NOVA.'],
      ].map(([title, copy], index) => <li key={title} className="hb:m-0! hb:p-0!">
        <p className="hb:font-semibold hb:mb-2!">{index + 1}. {title}</p><p className="hb:text-sm hb:text-[#485d6b]">{copy}</p>
      </li>)}
    </ol>
    <p className="notice hb:mt-6!">If the buyer does not pay, the seller can cancel before expiry or reclaim after expiry. NOVA is only shown as returned after verification.</p>
  </section>;
}
