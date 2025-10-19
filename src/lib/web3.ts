import { ethers } from 'ethers';

// Kontrak meme coin address dari pump.fun
const MEME_COIN_ADDRESS = '6aUG5S4YCyy4MWH6rtkDuF8fmYwwwPyKq4MypCCQpump';

// Minimal ABI untuk token SPL (Solana) atau ERC20 (Ethereum)
const TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!this.provider) {
        throw new Error('No wallet provider found');
      }

      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('No provider available');
      }

      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }

  async getMemeCoinBalance(userAddress: string): Promise<string> {
    return this.getTokenBalance(MEME_COIN_ADDRESS, userAddress);
  }

  async transferToken(tokenAddress: string, to: string, amount: string): Promise<boolean> {
    try {
      if (!this.signer) {
        throw new Error('No signer available');
      }

      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.signer);
      const parsedAmount = ethers.parseEther(amount);
      const tx = await contract.transfer(to, parsedAmount);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to transfer token:', error);
      return false;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    try {
      if (!this.provider) {
        throw new Error('No provider available');
      }

      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
      const name = await contract.name();
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      const result = {
        name: name,
        symbol: symbol,
        decimals: Number(decimals)
      };
      return result;
    } catch (error) {
      console.error('Failed to get token info:', error);
      return { name: 'Unknown', symbol: 'UNK', decimals: 18 };
    }
  }

  getMemeCoinAddress(): string {
    return MEME_COIN_ADDRESS;
  }
}

// Export singleton instance
export const web3Service = new Web3Service();