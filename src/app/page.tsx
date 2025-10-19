'use client';

import { WalletConnect } from '@/components/wallet-connect';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <div className="min-h-screen futuristic-navy-bg">
      <header className="border-b border-blue-900/30 backdrop-blur-md bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="https://z-cdn-media.chatglm.cn/files/e251e836-c658-4fb6-b367-159360a55817_moboy.png?auth_key=1792346667-37c6e2ae131145879edef74e941e64dd-0-ad1d30816d15a24b351ea6982c8bb5ed" 
              alt="MoBoy" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold futuristic-accent futuristic-glow">MoBoy</h1>
              <p className="text-sm futuristic-muted">Post and Get Reward</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>
      
      <main className="container mx-auto py-8 relative z-10">
        <Dashboard />
      </main>
    </div>
  );
}