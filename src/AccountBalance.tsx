import type { readMarketBalance } from './market';

export default function AccountBalance({ role, balance, loading, error, locked, onRefresh }: {
  role: string; balance?: Awaited<ReturnType<typeof readMarketBalance>>;
  loading: boolean; error: boolean; locked: boolean; onRefresh: () => void;
}) {
  return <section className="market-balance" aria-labelledby="balance-heading">
   <div className="market-balance-heading"><h3 id="balance-heading">{role==='Not connected'?'Your NOVA balance':role+' account · NOVA balance'}</h3>{role!=='Not connected'&&<button className="secondary" disabled={loading||locked} onClick={onRefresh}>{loading?'Refreshing balance…':'Refresh balance'}</button>}</div>
   {role==='Not connected'?<p>Connect an account to view its available and locked NOVA.</p>:<>
    <dl><div><dt>Available</dt><dd>{balance?balance.available+' NOVA':'—'}</dd></div><div><dt>Locked in Holds</dt><dd>{balance?balance.held+' NOVA':'—'}</dd></div><div><dt>Total · available + locked</dt><dd>{balance?balance.total+' NOVA':'—'}</dd></div></dl>
    <p className="muted" role="status">{error?(balance?'Balance update unavailable. Last successful read is retained.':'Balance unavailable. Refresh to try again.'):(loading?'Reading current Testnet balances…':!balance?'Balance has not been read.':'Testnet balance read.')}{balance&&<> Last read: {new Date(Number(balance.timestamp)*1000).toLocaleString()} · Block {balance.block}.</>}</p>
   </>}
  </section>;
}
