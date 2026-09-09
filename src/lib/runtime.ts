export const productionOrigin = import.meta.env?.VITE_PUBLIC_ORIGIN || 'http://127.0.0.1:4173';

export const productionURL = productionOrigin + (import.meta.env?.BASE_URL || '/');

export function isTradingOrigin(origin: string, production: boolean, configured = productionOrigin): boolean {
  if (!production || origin !== configured) return false;
  if (configured === 'http://127.0.0.1:4173') return true;
  try {
    const url = new URL(configured);
    return url.protocol === 'https:' && url.origin === configured;
  } catch { return false; }
}

// Empty means the existing same-origin local Vite proxy.
export const apiOrigin = import.meta.env?.VITE_API_ORIGIN || '';
export function apiURL(path: string, configured = apiOrigin): string {
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:' || url.origin !== configured) throw new Error('Invalid API origin');
  }
  return configured + '/api/' + path;
}
