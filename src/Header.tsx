type HeaderProps = {
  activeRole: string | undefined;
  connected: boolean;
  disabled: boolean;
  onWallet: () => void;
};

export default function Header({ activeRole, connected, disabled, onWallet }: HeaderProps) {
  return <div className="hb:sticky hb:top-0 hb:z-10 hb:bg-[#f7f9fb]">
    <header>
      <div><h1>HoldBook</h1></div>
      <div className="header-wallet">
        <p className="network">Hedera Testnet · {activeRole ?? 'Not connected'}</p>
        <button type="button" className="secondary" disabled={disabled} aria-describedby="wallet-status" onClick={onWallet}>
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </header>
  </div>;
}
