'use client';

import { useWalletStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function SimpleWalletConnect() {
  const { isConnected, address, isConnecting, balance, connectWallet, disconnectWallet } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openSolanaExplorer = () => {
    if (address) {
      window.open(`https://explorer.solana.com/address/${address}?cluster=mainnet-beta`, '_blank');
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-blue-900/30 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">Connected</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs bg-slate-700/50 border-blue-900/30">
            {address.slice(0, 4)}...{address.slice(-4)}
          </Badge>
          <span className="text-xs text-blue-400">{balance.toFixed(4)} SOL</span>
        </div>
        
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openSolanaExplorer}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
          >
            ×
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-orange-900/30 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-orange-400" />
        <span className="text-sm text-orange-400">Wallet Required</span>
      </div>
      
      <Button 
        onClick={connectWallet} 
        disabled={isConnecting}
        size="sm"
        className="ml-auto futuristic-button"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
}