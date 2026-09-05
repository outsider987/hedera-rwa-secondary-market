export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header>
        <div>
          <h1>HoldBook</h1>
          <p>Equity lifecycle verification</p>
        </div>
        <p className="network">Hedera Testnet · Chain 296<br />Configured, not verified</p>
      </header>

      <main id="main">
        <section className="notice" aria-labelledby="status-heading">
          <h2 id="status-heading">T00 · Shell ready</h2>
          <p>Wallet not connected. ATS integration has not started.</p>
          <p>Next: connect MetaMask and verify the ATS configuration in T01.</p>
        </section>

        <div className="columns">
          <section aria-labelledby="asset-heading">
            <h2 id="asset-heading">Planned asset</h2>
            <p className="asset-name">Nova Private Equity Common Shares</p>
            <p>Fictional Testnet asset. Synthetic KYC only.</p>
            <dl>
              <div><dt>Symbol</dt><dd>NOVA</dd></div>
              <div><dt>ISIN</dt><dd><code>USNOVA000016</code></dd></div>
              <div><dt>Decimals</dt><dd>0</dd></div>
              <div><dt>Authorized shares</dt><dd>1,000</dd></div>
              <div><dt>Security ID</dt><dd>Not created</dd></div>
            </dl>
            <p>These are planned settings, not balances or verified on-chain data.</p>
          </section>

          <section aria-labelledby="sequence-heading">
            <h2 id="sequence-heading">Verification sequence</h2>
            <ol>
              <li><strong>ATS readiness</strong><span>Connect three accounts, resolve config, verify a test VC.</span></li>
              <li><strong>Create NOVA</strong><span>Review the settings and approve Equity creation.</span></li>
              <li><strong>Seller KYC &amp; issuance</strong><span>Grant synthetic KYC and issue 100 NOVA.</span></li>
              <li><strong>Prove the Hold lifecycle</strong><span>Hold 10, verify KYC rejection, grant Buyer KYC, execute 6, release 4.</span></li>
            </ol>
            <p>All steps are pending. Victor approves each signature in MetaMask.</p>
          </section>
        </div>

        <section className="evidence" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Transaction evidence</h2>
          <p>No transactions yet.</p>
          <p>T00 never connects to a wallet or sends transactions. Public identifiers and verified results will appear here in later tickets.</p>
        </section>
      </main>

      <footer>
        <p>Testnet demonstration only. No real securities, identity checks, or legal compliance claims.</p>
        <a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/HANDOFF.md">Read the project handoff</a>
      </footer>
    </>
  );
}
