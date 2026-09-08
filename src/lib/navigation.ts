export type Page = 'overview' | 'market' | 'activity' | 'settings';

export function resolvePage(hash: string): Page | undefined {
  const name = hash.replace(/^#/, '');
  if (name === 'main') return undefined;
  if (['trade', 'history', 'my-orders-heading', 'matches-heading'].includes(name)) return 'activity';
  return ['overview', 'market', 'activity', 'settings'].includes(name) ? name as Page : 'overview';
}
