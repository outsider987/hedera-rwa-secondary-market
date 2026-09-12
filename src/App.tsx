import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useConnect, useConnection, useDisconnect } from 'wagmi';
import { acquireOperation, getOperationBusy, releaseOperation, subscribeOperation, loadRoles, rolesStorageKey, saveRoles, storageWarning, type Roles } from './lib/guards';
import { invalidateWalletSession, getWalletSession, subscribeWalletSession, testnetChainId, walletConfig } from './lib/wallet';
import type { TradeRecord } from './lib/evidence';
import MarketPanel from './components/MarketPanel';
import Header from './components/Header';
import OverviewPage from './pages/OverviewPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import {demoMode,demoURL} from './presentation/demoState';
import { resolvePage, type Page } from './lib/navigation';
import { loadTradeRecords } from './lib/trade';
import {loadSettlement} from './lib/settlement';
import { accounts } from './lib/lifecycle';

export default function App() {
  const connection = useConnection();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const session = useSyncExternalStore(subscribeWalletSession, getWalletSession, () => 0);
  const [saved, setSaved] = useState(() => typeof window === 'undefined' ? { roles: {}, warning: '' } : loadRoles());
  const savedRef = useRef(saved);
  const [marketNotice,setMarketNotice]=useState('');
  const [savedSettlementNotice,setSavedSettlementNotice]=useState('');
  const [demo,setDemo]=useState(()=>typeof window!=='undefined'&&demoMode(window.location.search));
  function changeDemo(enabled:boolean){history.replaceState(null,'',demoURL(window.location.href,enabled));setDemo(enabled);}
  useEffect(()=>{const change=()=>setDemo(demoMode(window.location.search));window.addEventListener('popstate',change);return()=>window.removeEventListener('popstate',change);},[]);
  const [page,setPage] = useState<Page>('overview');
  useEffect(()=>{window.scrollTo(0,0);},[page]);
  const [tradeRecords] = useState<TradeRecord[]>(()=>{try{return loadTradeRecords();}catch{return [];}});
  useEffect(()=>{if(page!=='overview')return;try{const saved=loadSettlement();setSavedSettlementNotice(saved?.attempted&&!saved.rejected&&!['verified','reverted'].includes(saved.operation.status)?'Saved settlement is unresolved. Query the original operation in Market.':'');}catch{setSavedSettlementNotice('Saved settlement could not be read. Preserve its original record and open Market for recovery.');}},[page,demo]);
  useEffect(() => {
    const change = () => { const next = resolvePage(window.location.hash); if (next) setPage(next); };
    change(); window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== rolesStorageKey && event.key !== null) return;
      const next = loadRoles(); savedRef.current = next; setSaved(next); invalidateWalletSession();
    };
    window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed);
  }, []);
  const [walletMessage, setWalletMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useSyncExternalStore(subscribeOperation, getOperationBusy, () => false);
  const operation = useRef(false);
  const ready = connection.isConnected && connection.chainId === testnetChainId && !busy;

  async function handleWallet() {
    if (operation.current || getOperationBusy()) return;
    const lease = acquireOperation();
    operation.current = true;
    setBusy(true);
    setWalletMessage('');
    try {
      if (connection.isConnected) await disconnect.mutateAsync({});
      else {
        const connector = walletConfig.connectors[0];
        if (!await connector.getProvider()) {
          setWalletMessage('MetaMask was not found. Install and enable MetaMask in desktop Chrome, then reload.');
          return;
        }
        await connect.mutateAsync({ connector });
      }
    } catch {
      setWalletMessage('The wallet request was not completed. Check MetaMask, then try again when ready.');
    } finally {
      operation.current = false;
      setBusy(false);
      releaseOperation(lease);
    }
  }

  function changeRoles(update: (roles: Roles) => Roles) {
    const latest = savedRef.current;
    const roles = update(latest.roles);
    if (roles === latest.roles) return;
    savedRef.current = { roles, warning: latest.warning || (saveRoles(roles) ? '' : storageWarning) };
    invalidateWalletSession();
    setSaved(savedRef.current);
  }

  const activeRole=Object.entries(accounts).find(([,a])=>a.address === connection.address?.toLowerCase())?.[0];
  const deployment=tradeRecords.find(r=>r.action === 'deploy' && r.status === 'complete');
  return <>
    <a className="skip-link hb:z-20" href="#main">Skip to content</a>
    <Header activeRole={activeRole} connected={connection.isConnected} disabled={busy || locked} onWallet={handleWallet} isDemo={demo || page === 'overview'}/>
    <main id="main" className={demo&&page==='overview'?'presentation-main':undefined}>
      <nav className="page-nav hb:flex-wrap hb:gap-2! hb:sm:gap-8!" aria-label="Main navigation">{['overview','market','activity','settings'].map(item=><a key={item} href={'#'+item} onClick={e=>{if(page===item){e.preventDefault();window.scrollTo(0,0);}}} aria-current={page === item ? 'page' : undefined}>{item[0].toUpperCase()+item.slice(1)}</a>)}</nav>
      <p id="wallet-status" role="status" aria-live="polite" className="wallet-status">{busy ? 'Wallet request pending. Complete or reject it in MetaMask.' : connection.isConnected ? ready ? 'Connected to Hedera Testnet.' : 'Wrong network. Switch to Hedera Testnet (296 / 0x128) in MetaMask.' : demo&&page==='overview'?'':'Wallet not connected. Connect when ready.'}</p>
      {demo&&page!=='overview'&&<button className="secondary" onClick={()=>changeDemo(false)}>Exit Demo</button>}
      {walletMessage && <p role="alert">{walletMessage}</p>}{saved.warning && <p className="storage-warning" role="alert">{saved.warning}</p>}
      {page==='overview'&&savedSettlementNotice&&<p role="alert">{savedSettlementNotice} <a href="#market">Open Market</a></p>}
      {page==='overview'&&tradeRecords.some(r=>r.kind==='t05-transaction'&&!['complete','rejected'].includes(r.status))&&<p role="alert">A saved T05 operation needs review. <a href="#activity">Open Activity</a> to inspect its original record.</p>}
      {page==='overview'&&marketNotice&&<p role="alert">{marketNotice} <a href="#market">Open Market</a></p>}
      <OverviewPage visible={page === 'overview'} demo={demo} onMode={changeDemo}/>
      <div hidden={page !== 'market' && page !== 'activity'}><MarketPanel visible={page === 'market' || page === 'activity'} activity={page === 'activity'} roles={saved.roles} session={session} activeAccount={connection.address} onNotice={setMarketNotice}/></div>
      <ActivityPage visible={page === 'activity'} session={session} tradeRecords={tradeRecords}/>
      <SettingsPage visible={page === 'settings'} address={connection.address} chainId={connection.chainId} swapAddress={deployment?.input.escrow} session={session} ready={ready} roles={saved.roles} changeRoles={changeRoles}/>
    </main>
    <footer><p>Testnet demonstration only. Synthetic KYC; no real securities or identity checks.</p><a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/HANDOFF.md">Project handoff</a></footer>
  </>;
}
