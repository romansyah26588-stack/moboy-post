'use client';

import { useEffect } from 'react';

export function WalletDebugger() {
  useEffect(() => {
    // Debug wallet availability
    const checkWallets = () => {
      console.log('=== WALLET DEBUG INFO ===');
      console.log('Window object:', typeof window);
      
      if (typeof window !== 'undefined') {
        console.log('Phantom installed:', !!window.solana?.isPhantom);
        console.log('Phantom connected:', !!window.solana?.isConnected);
        console.log('Phantom public key:', window.solana?.publicKey?.toString());
        
        console.log('Solflare installed:', !!window.solflare);
        console.log('Solflare connected:', !!window.solflare?.isConnected);
        console.log('Solflare public key:', window.solflare?.publicKey?.toString());
        
        // Check if any wallet is available
        const hasPhantom = window.solana?.isPhantom;
        const hasSolflare = window.solflare;
        
        if (!hasPhantom && !hasSolflare) {
          console.warn('❌ No Solana wallet detected!');
          console.log('Please install Phantom: https://phantom.app/');
          console.log('Or install Solflare: https://solflare.com/');
        } else {
          console.log('✅ At least one wallet is available');
        }
      }
      
      console.log('========================');
    };

    // Check immediately
    checkWallets();
    
    // Check again after a delay (in case wallets load slowly)
    const timer = setTimeout(checkWallets, 2000);
    
    // Listen for wallet events
    const handleAccountsChanged = () => {
      console.log('🔄 Wallet accounts changed');
      checkWallets();
    };

    if (typeof window !== 'undefined') {
      if (window.solana?.isPhantom) {
        window.solana.on('accountChanged', handleAccountsChanged);
      }
      if (window.solflare) {
        window.solflare.on('accountChanged', handleAccountsChanged);
      }
    }

    return () => {
      clearTimeout(timer);
      // Cleanup listeners
      if (typeof window !== 'undefined') {
        if (window.solana?.isPhantom) {
          window.solana?.removeAllListeners?.('accountChanged');
        }
        if (window.solflare) {
          window.solflare?.removeAllListeners?.('accountChanged');
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything
}