'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  walletAddress: string;
  name?: string;
  profileImage?: string;
  totalEarnings: number;
}

interface WalletStore {
  isConnected: boolean;
  address: string | null;
  user: User | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setUser: (user: User) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      isConnected: false,
      address: null,
      user: null,
      isConnecting: false,
      
      connectWallet: async () => {
        set({ isConnecting: true });
        
        try {
          console.log('🔗 Starting wallet connection...');
          
          // Check if we're in browser
          if (typeof window === 'undefined') {
            throw new Error('Not in browser environment');
          }

          // Simple check for any wallet
          let wallet = null;
          let walletName = '';

          // Check Phantom
          if (window.solana && window.solana.isPhantom) {
            wallet = window.solana;
            walletName = 'Phantom';
            console.log('✅ Found Phantom wallet');
          }
          // Check Solflare
          else if (window.solflare) {
            wallet = window.solflare;
            walletName = 'Solflare';
            console.log('✅ Found Solflare wallet');
          }
          // Check generic window.solana
          else if (window.solana) {
            wallet = window.solana;
            walletName = 'Generic Solana';
            console.log('✅ Found generic Solana wallet');
          }
          else {
            throw new Error('No wallet found. Please install Phantom or Solflare.');
          }

          // Try to connect
          console.log(`🔌 Connecting to ${walletName}...`);
          
          const response = await wallet.connect();
          console.log('📝 Connection response:', response);
          
          if (response && response.publicKey) {
            const address = response.publicKey.toString();
            console.log(`📍 Wallet address: ${address}`);
            
            // Basic validation - just check if it looks like an address
            if (address && address.length > 20) {
              set({
                isConnected: true,
                address: address,
                isConnecting: false,
              });
              
              console.log(`✅ Successfully connected to ${walletName}!`);
              console.log(`📍 Address: ${address}`);
              
              // Show success message
              alert(`Connected to ${walletName} wallet!\nAddress: ${address.slice(0, 8)}...${address.slice(-8)}`);
              
              return;
            } else {
              throw new Error('Invalid wallet address received');
            }
          } else {
            throw new Error('No public key received from wallet');
          }
          
        } catch (error) {
          console.error('❌ Connection failed:', error);
          set({ isConnecting: false });
          
          let errorMessage = 'Failed to connect wallet.';
          
          if (error.message.includes('No wallet found')) {
            errorMessage = 'No wallet found. Please install Phantom or Solflare wallet.\n\nInstall Phantom: https://phantom.app/\nInstall Solflare: https://solflare.com/';
          } else if (error.message.includes('User rejected')) {
            errorMessage = 'Connection rejected by user. Please try again.';
          } else {
            errorMessage = `Connection failed: ${error.message}`;
          }
          
          alert(errorMessage);
        }
      },
      
      disconnectWallet: () => {
        try {
          console.log('🔌 Disconnecting wallet...');
          
          // Try to disconnect from available wallets
          if (window.solana?.isPhantom) {
            window.solana.disconnect();
          }
          if (window.solflare) {
            window.solflare.disconnect();
          }
          
          set({
            isConnected: false,
            address: null,
            user: null,
          });
          
          console.log('✅ Wallet disconnected');
          alert('Wallet disconnected successfully');
        } catch (error) {
          console.error('❌ Disconnect error:', error);
        }
      },
      
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);