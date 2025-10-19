'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWalletStore } from '@/lib/store';
import { Wallet, LogOut, User } from 'lucide-react';

export function WalletConnect() {
  const { isConnected, address, user, isConnecting, connectWallet, disconnectWallet } = useWalletStore();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 futuristic-button futuristic-input">
            <Avatar className="h-6 w-6 bg-slate-700/50">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback>
                <User className="h-4 w-4 futuristic-accent" />
              </AvatarFallback>
            </Avatar>
            {formatAddress(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="futuristic-card border-blue-900/30">
          <DropdownMenuLabel className="futuristic-text">My Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-blue-900/30" />
          <DropdownMenuItem className="futuristic-text hover:bg-slate-700/50">
            <User className="mr-2 h-4 w-4 futuristic-accent" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet} className="futuristic-text hover:bg-slate-700/50">
            <LogOut className="mr-2 h-4 w-4 futuristic-accent" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="flex items-center gap-2 futuristic-button"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}