'use client';

import { useWalletStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function WalletConnection() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWalletStore();
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
      <Card className="futuristic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 futuristic-accent">
            <Wallet className="h-5 w-5" />
            Solana Wallet Connected
          </CardTitle>
          <CardDescription className="futuristic-text">
            Your wallet is connected to Solana Mainnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm futuristic-muted">Address:</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs bg-slate-700/50 border-blue-900/30">
                  {address.slice(0, 4)}...{address.slice(-4)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 futuristic-text"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openSolanaExplorer}
                  className="h-6 w-6 p-0 futuristic-text"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm futuristic-muted">Network:</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Mainnet Beta
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm futuristic-muted">Status:</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Connected
              </Badge>
            </div>
          </div>
          <Button 
            onClick={disconnectWallet} 
            variant="outline" 
            className="w-full futuristic-border futuristic-text"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="futuristic-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 futuristic-accent">
          <Wallet className="h-5 w-5" />
          Connect Solana Wallet
        </CardTitle>
        <CardDescription className="futuristic-text">
          Connect your Phantom or Solflare wallet to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm futuristic-muted">
            <p className="mb-2">Supported wallets:</p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Phantom
              </Badge>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Solflare
              </Badge>
            </div>
          </div>
          <div className="text-sm futuristic-muted">
            <p className="mb-1">Network:</p>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Solana Mainnet Beta
            </Badge>
          </div>
        </div>
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="w-full futuristic-button"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        {!isConnecting && (
          <div className="text-xs futuristic-muted text-center">
            Don't have a wallet?{' '}
            <a 
              href="https://phantom.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Install Phantom
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}