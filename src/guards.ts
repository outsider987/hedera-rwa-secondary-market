export const roleNames = ['Admin', 'Seller', 'Buyer'] as const;
export type Role = typeof roleNames[number];
export type Roles = Partial<Record<Role, string>>;
export type MirrorAccount = { address: string; accountId: string };
export const rolesStorageKey = 'holdbook.testnet.roles.v1';

export function isAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[\da-f]{40}$/i.test(value);
}

export function validateMirrorAccount(address: string, value: unknown): MirrorAccount {
  if (!isAddress(address) || !value || typeof value !== 'object') {
    throw new Error('Mirror returned invalid account data. Retry the lookup.');
  }
  const account = value as Record<string, unknown>;
  if (!isAddress(account.evm_address) || account.evm_address.toLowerCase() !== address.toLowerCase()
    || typeof account.account !== 'string' || !/^0\.0\.[1-9]\d*$/.test(account.account)
    || account.deleted !== false) {
    throw new Error('Mirror account does not match, is deleted, or has an invalid Hedera ID. Retry the lookup.');
  }
  return { address: address.toLowerCase(), accountId: account.account };
}

export function bindingProblem(role: Role, current: MirrorAccount | undefined, roles: Roles,
  verified: ReadonlyMap<string, MirrorAccount>): string | undefined {
  if (roles[role]) return 'Clear this role before replacing it.';
  if (!current) return 'Verify the current account on Hedera Testnet first.';
  const ids = new Set<string>();
  for (const name of roleNames) {
    const address = roles[name]?.toLowerCase();
    if (!address) continue;
    if (address === current.address.toLowerCase()) return `This account is already assigned to ${name}.`;
    const account = verified.get(address);
    if (!account) return 'Wait for saved accounts to verify, or clear them.';
    if (ids.has(account.accountId)) return 'Saved roles share a Hedera ID. Clear one of the conflicting roles.';
    ids.add(account.accountId);
    if (account.accountId === current.accountId) return `This Hedera ID is already assigned to ${name}.`;
  }
}

export const storageWarning = 'Storage unavailable or invalid. Changes last only for this page; older saved roles may return on reload.';

export function loadRoles(getStorage: () => Pick<Storage, 'getItem'> = () => window.localStorage) {
  try {
    const raw = getStorage().getItem(rolesStorageKey);
    const data: unknown = raw === null ? {} : JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    const roles: Roles = {};
    for (const [key, value] of Object.entries(data)) {
      if (!roleNames.includes(key as Role) || !isAddress(value)
        || Object.values(roles).includes(value.toLowerCase())) throw new Error();
      roles[key as Role] = value.toLowerCase();
    }
    return { roles, warning: '' };
  } catch {
    return { roles: {} as Roles, warning: storageWarning };
  }
}

export function saveRoles(roles: Roles, getStorage: () => Pick<Storage, 'setItem'> = () => window.localStorage): boolean {
  try {
    // Serialize only the three public addresses, never query or wallet objects.
    const addresses = Object.fromEntries(roleNames.filter(role => roles[role]).map(role => [role, roles[role]]));
    getStorage().setItem(rolesStorageKey, JSON.stringify(addresses));
    return true;
  } catch {
    return false;
  }
}
