import PixelSprite from './PixelSprite';
import { accounts, fallbackBalances } from '../lib/lifecycle';

type HeaderProps = {
  activeRole: string | undefined;
  connected: boolean;
  disabled: boolean;
  onWallet: () => void;
  isDemo?: boolean;
  balances?: Record<'Admin' | 'Seller' | 'Buyer', string>;
};

const roleKeys = ['Admin', 'Seller', 'Buyer'] as const;
const badgeColors: Record<'Admin' | 'Seller' | 'Buyer', string> = {
  Admin: 'hb:bg-purple-100/90 hb:text-purple-950 hb:border-purple-300 hover:hb:bg-purple-100',
  Seller: 'hb:bg-amber-100/90 hb:text-amber-950 hb:border-amber-300 hover:hb:bg-amber-100',
  Buyer: 'hb:bg-blue-100/90 hb:text-blue-950 hb:border-blue-300 hover:hb:bg-blue-100',
};

export default function Header({ activeRole, connected, disabled, onWallet, isDemo, balances = fallbackBalances }: HeaderProps) {
  const role = connected ? activeRole : undefined;
  const colors: Record<string, string> = {
    Admin: 'hb:bg-purple-50 hb:text-purple-900',
    Seller: 'hb:bg-amber-50 hb:text-amber-900',
    Buyer: 'hb:bg-blue-50 hb:text-blue-900',
  };
  const roleColors = colors[role ?? ''] ?? 'hb:bg-[#f7f9fb] hb:text-[#485d6b]';
  return <div className={`hb:sticky hb:top-0 hb:z-10 ${roleColors}`}>
    <header className="hb:flex-wrap hb:sm:flex-nowrap hb:gap-3!">
      <div className="header-brand-group hb:flex hb:flex-wrap hb:items-center hb:gap-3 hb:sm:gap-4">
        <div><h1>HoldBook</h1></div>
        <div className="header-accounts hb:flex hb:flex-wrap hb:items-center hb:gap-2" aria-label="HoldBook participants and NOVA balances">
          {roleKeys.map(r => {
            const isActive = connected && activeRole === r;
            const acc = accounts[r];
            return <a
              key={r}
              href="#settings"
              className={`header-account-pill hb:no-underline hb:inline-flex hb:items-center hb:gap-1.5 hb:px-2.5 hb:py-1 hb:rounded-full hb:text-xs hb:font-medium hb:border hb:transition-all ${badgeColors[r]} ${isActive ? 'hb:ring-2 hb:ring-[#155781] hb:ring-offset-1 hb:font-bold' : 'hb:opacity-90 hover:hb:opacity-100'}`}
              aria-current={isActive ? 'true' : undefined}
              title={`${r} (${acc.accountId}) · ${acc.address}${isActive ? ' (Connected)' : ''}`}
            >
              <span className={`hb:w-2 hb:h-2 hb:rounded-full ${isActive ? 'hb:bg-emerald-600' : 'hb:bg-gray-400'}`} aria-hidden="true" />
              <span>{r}</span>
              <span className="hb:opacity-60">·</span>
              <span className="hb:font-semibold">{balances[r]} NOVA</span>
            </a>;
          })}
        </div>
      </div>
      <div className="header-wallet">
        <div className="header-identity">
        {role&&['Admin','Seller','Buyer'].includes(role)&&<span className="header-role-avatar"><PixelSprite kind={role.toLowerCase()}/></span>}
        <p className="network">Hedera Testnet · <span className={`hb:inline-block hb:rounded hb:px-2 hb:py-1 hb:font-semibold ${roleColors}`}>
          {connected ? role ?? 'Unassigned account' : isDemo ? 'Recorded Demo · Wallet not required' : 'Not connected'}
        </span></p></div>
        <button type="button" className="secondary" disabled={disabled} aria-describedby="wallet-status" onClick={onWallet}>
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </header>
  </div>;
}
