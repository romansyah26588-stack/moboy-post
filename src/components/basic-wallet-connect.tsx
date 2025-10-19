'use client';

import { useWalletStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function BasicWalletConnect() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && address) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">Wallet Connected</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-6)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-400" />
          <div>
            <p className="text-orange-400 font-medium">Wallet Required</p>
            <p className="text-sm text-gray-400">Install Phantom or Solflare wallet</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>Need a wallet?</p>
        <div className="flex gap-2 mt-1">
          <a 
            href="https://phantom.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            Install Phantom
          </a>
          <span>•</span>
          <a 
            href="https://solflare.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-400 hover:underline"
          >
            Install Solflare
          </a>
        </div>
      </div>
    </div>
  );
}