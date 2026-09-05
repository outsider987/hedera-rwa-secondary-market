export type AtsLoadState = 'idle' | 'loading' | 'loaded' | 'failed';

let attempt: Promise<'loaded' | 'failed'> | undefined;

export function loadAts(): Promise<'loaded' | 'failed'> {
  attempt ??= import('@hashgraph/asset-tokenization-sdk')
    .then((sdk): 'loaded' | 'failed' =>
      typeof sdk.Management?.resolveLatestConfigVersion === 'function' ? 'loaded' : 'failed',
    )
    .catch(() => 'failed' as const);
  return attempt;
}
