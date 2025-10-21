'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWalletStore } from '@/lib/store';
import { Hand, Trophy, Link2, Copy, Check, ExternalLink } from 'lucide-react';
import { BasicWalletConnect } from '@/components/basic-wallet-connect';

interface Content {
  id: string;
  link: string;
  walletAddress: string;
  viewCount: number;
  createdAt: string;
  user?: {
    walletAddress: string;
    name?: string;
  };
}

interface LeaderboardUser {
  id: string;
  walletAddress: string;
  totalEarnings: number;
  contentCount: number;
  name?: string;
}

export function Dashboard() {
  const { isConnected, address } = useWalletStore();
  const [submitLink, setSubmitLink] = useState('');
  const [contents, setContents] = useState<Content[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from API
  useEffect(() => {
    fetchContents();
    fetchLeaderboard();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/contents');
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const validateContentLink = (link: string): boolean => {
    // Remove whitespace and convert to lowercase for validation
    const cleanLink = link.trim().toLowerCase();
    
    // Check if it's a valid URL
    try {
      const url = new URL(cleanLink);
      
      // Check if the protocol is http or https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
      }
      
      // Check if it has a valid domain
      if (!url.hostname || url.hostname.length < 3) {
        return false;
      }
      
      // Check for common content platforms and valid domains
      const validDomains = [
        // Social media platforms
        'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 
        'tiktok.com', 'youtube.com', 'youtu.be', 'linkedin.com',
        'reddit.com', 'discord.com', 'telegram.org',
        
        // Content platforms
        'medium.com', 'substack.com', 'github.com', 'gitlab.com',
        'dribbble.com', 'behance.net', 'pinterest.com',
        
        // Video platforms
        'vimeo.com', 'twitch.tv', 'kick.com',
        
        // Music platforms
        'spotify.com', 'soundcloud.com', 'bandcamp.com',
        
        // General domains (allow any valid domain)
        // This will catch .com, .org, .net, .io, .co, etc.
      ];
      
      // Extract domain without subdomains for checking
      const domainParts = url.hostname.split('.');
      const mainDomain = domainParts.slice(-2).join('.');
      
      // Allow any valid TLD
      const validTLDs = [
        'com', 'org', 'net', 'io', 'co', 'app', 'dev', 'tech', 'ai',
        'xyz', 'me', 'site', 'online', 'store', 'shop', 'blog', 'news',
        'info', 'biz', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'kr',
        'cn', 'in', 'br', 'mx', 'es', 'it', 'nl', 'se', 'no', 'fi',
        'ru', 'tr', 'sa', 'ae', 'eg', 'za', 'ng', 'ke', 'gh', 'ph',
        'th', 'vn', 'my', 'sg', 'id', 'pk', 'bd', 'lk', 'np', 'mm'
      ];
      
      const tld = domainParts[domainParts.length - 1];
      
      // Check if it's a known content platform or has a valid TLD
      return validDomains.includes(mainDomain) || validTLDs.includes(tld);
      
    } catch (error) {
      // If URL parsing fails, it's not a valid URL
      return false;
    }
  };

  const checkDuplicateLink = async (link: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/contents');
      if (response.ok) {
        const contents: Content[] = await response.json();
        return contents.some(content => 
          content.link.toLowerCase() === link.trim().toLowerCase()
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking duplicate link:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!submitLink.trim()) {
      alert('Please enter a content link');
      return;
    }
    
    // Validate the link
    if (!validateContentLink(submitLink)) {
      alert('Failed To Submit (Not Content Link)');
      return;
    }
    
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsLoading(true);
    try {
      // Check for duplicate link
      const isDuplicate = await checkDuplicateLink(submitLink);
      if (isDuplicate) {
        alert('Failed To Submit (Content Link Already Exists)');
        return;
      }

      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: submitLink.trim(),
          walletAddress: address,
        }),
      });

      if (response.ok) {
        const newContent = await response.json();
        setContents([newContent, ...contents]);
        setSubmitLink('');
        alert('Content submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit content');
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      alert('Failed to submit content');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-3 futuristic-border bg-slate-800/50 backdrop-blur-md">
          <TabsTrigger value="home" className="futuristic-text data-[state=active]:futuristic-accent">Home</TabsTrigger>
          <TabsTrigger value="content" className="futuristic-text data-[state=active]:futuristic-accent">Content List</TabsTrigger>
          <TabsTrigger value="leaderboard" className="futuristic-text data-[state=active]:futuristic-accent">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-6">
          <Card className="max-w-2xl mx-auto futuristic-card">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold futuristic-accent futuristic-glow">MoBoy</CardTitle>
              <CardDescription className="futuristic-text">
                Submit your content link about MOMO COIN
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Wallet Connection */}
              <BasicWalletConnect />
              
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/content-link"
                  value={submitLink}
                  onChange={(e) => setSubmitLink(e.target.value)}
                  className="flex-1 futuristic-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="px-8 futuristic-button">
                  <Hand className="mr-2 h-4 w-4" />
                  {isLoading ? 'Submitting...' : 'Submit Here'}
                </Button>
              </div>
              <p className="text-xs futuristic-muted text-center">
                Valid content links: YouTube, x.com, Instagram, TikTok, Facebook, Reddit, and more
              </p>
              {!isConnected && (
                <p className="text-sm futuristic-muted text-center">
                  Connect your wallet to submit content
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reward Terms - Separate Card */}
          <Card className="max-w-2xl mx-auto futuristic-card">
            <CardHeader>
              <h4 className="font-semibold text-center futuristic-accent">Reward Terms</h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="font-bold futuristic-accent min-w-[20px]">1.</span>
                  <span className="futuristic-text">Minimum cumulative 1,000 views across multiple content posts for 0.01 SOL.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold futuristic-accent min-w-[20px]">2.</span>
                  <span className="futuristic-text">Multiples apply and there is no time limit.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold futuristic-accent min-w-[20px]">3.</span>
                  <span className="futuristic-text">All types of content (images, text, animation, video) regardless of their form are of equal value.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold futuristic-accent min-w-[20px]">4.</span>
                  <span className="futuristic-text">Paid content only discusses or is related to MOMO COIN.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="futuristic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-accent">
                <Link2 className="h-5 w-5" />
                Content List
              </CardTitle>
              <CardDescription className="futuristic-text">
                All submitted content links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {contents.map((content) => (
                    <div
                      key={content.id}
                      className="flex items-center justify-between p-4 border border-blue-900/30 rounded-lg bg-slate-800/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-slate-700/50">
                          <AvatarFallback>
                            <Link2 className="h-4 w-4 futuristic-accent" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <a 
                              href={content.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium futuristic-accent hover:underline flex items-center gap-1"
                            >
                              {content.link}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm futuristic-muted">
                            <Badge 
                              variant="secondary" 
                              className="cursor-pointer bg-slate-700/50 border-blue-900/30 futuristic-text"
                              onClick={() => copyToClipboard(content.walletAddress)}
                            >
                              {copiedAddress === content.walletAddress ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : (
                                <Copy className="h-3 w-3 mr-1" />
                              )}
                              {content.walletAddress}
                            </Badge>
                            <span>•</span>
                            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {contents.length === 0 && (
                    <p className="text-center futuristic-muted py-8">
                      No content submitted yet. Be the first!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="futuristic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-accent">
                <Trophy className="h-5 w-5" />
                Earnings Leaderboard
              </CardTitle>
              <CardDescription className="futuristic-text">
                Top earners on the MoBoy platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-blue-900/30 rounded-lg bg-slate-800/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm futuristic-glow">
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10 bg-slate-700/50">
                          <AvatarFallback>
                            <Trophy className="h-5 w-5 futuristic-accent" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium futuristic-text">{user.name || user.walletAddress}</p>
                          <p className="text-sm futuristic-muted">
                            {user.contentCount} contents
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg futuristic-accent futuristic-glow">{user.totalEarnings.toFixed(4)} SOL</p>
                        <p className="text-sm futuristic-muted">Total Earnings</p>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-center futuristic-muted py-8">
                      No earnings yet. Start submitting content!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
