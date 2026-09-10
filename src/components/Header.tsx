import PixelSprite from './PixelSprite';
type HeaderProps = {
  activeRole: string | undefined;
  connected: boolean;
  disabled: boolean;
  onWallet: () => void;
};

export default function Header({ activeRole, connected, disabled, onWallet }: HeaderProps) {
  const role = connected ? activeRole : undefined;
  const colors: Record<string, string> = {
    Admin: 'hb:bg-purple-50 hb:text-purple-900',
    Seller: 'hb:bg-amber-50 hb:text-amber-900',
    Buyer: 'hb:bg-blue-50 hb:text-blue-900',
  };
  const roleColors = colors[role ?? ''] ?? 'hb:bg-[#f7f9fb] hb:text-[#485d6b]';
  return <div className={`hb:sticky hb:top-0 hb:z-10 ${roleColors}`}>
    <header>
      <div><h1>HoldBook</h1></div>
      <div className="header-wallet">
        <div className="header-identity">
        {role&&['Admin','Seller','Buyer'].includes(role)&&<span className="header-role-avatar"><PixelSprite kind={role.toLowerCase()}/></span>}
        <p className="network">Hedera Testnet · <span className={`hb:inline-block hb:rounded hb:px-2 hb:py-1 hb:font-semibold ${roleColors}`}>
          {connected ? role ?? 'Unassigned account' : 'Not connected'}
        </span></p></div>
        <button type="button" className="secondary" disabled={disabled} aria-describedby="wallet-status" onClick={onWallet}>
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </header>
  </div>;
}
