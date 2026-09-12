import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import App from './App';
import { queryClient, walletConfig } from './lib/wallet';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={walletConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
