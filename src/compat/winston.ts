// Browser logging boundary for ATS LogService's log/printf/Console API.
// SDK messages, formatter callbacks and metadata must never reach public logs.
export function createLogger(options: { level?: string } = {}) {
  const verbose = options.level === 'TRACE';
  return {
    log(level: unknown, _message?: unknown, _metadata?: unknown) {
      if (level === 'ERROR') console.error('[ATS] ERROR: details withheld.');
      else if (level === 'INFO' && (verbose || options.level === 'INFO')) {
        console.info('[ATS] INFO: details withheld.');
      } else if (level === 'TRACE' && verbose) console.debug('[ATS] TRACE: details withheld.');
    },
  };
}

export const format = { printf: (_formatter: unknown) => ({}) };
export const transports = { Console: class {} };

export default class BrowserFileTransport {
  constructor() {
    throw new Error('File logging is unavailable in this browser console.');
  }
}
