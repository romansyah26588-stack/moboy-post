// Simple wallet test script
// Copy and paste this into browser console to test wallet connection

console.log('🧪 Starting Simple Wallet Test...');

// Test 1: Check if window object exists
console.log('1. Window exists:', typeof window !== 'undefined');

// Test 2: Check for wallets
if (typeof window !== 'undefined') {
  console.log('2. Wallet Detection:');
  console.log('   - window.solana exists:', !!window.solana);
  console.log('   - window.solana.isPhantom:', !!window.solana?.isPhantom);
  console.log('   - window.solflare exists:', !!window.solflare);
  
  // Test 3: Try to get wallet instance
  let wallet = null;
  let walletName = '';
  
  if (window.solana?.isPhantom) {
    wallet = window.solana;
    walletName = 'Phantom';
  } else if (window.solflare) {
    wallet = window.solflare;
    walletName = 'Solflare';
  } else if (window.solana) {
    wallet = window.solana;
    walletName = 'Generic Solana';
  }
  
  console.log('3. Selected wallet:', walletName || 'None found');
  
  if (wallet) {
    console.log('4. Wallet methods available:');
    console.log('   - connect:', typeof wallet.connect);
    console.log('   - disconnect:', typeof wallet.disconnect);
    console.log('   - isConnected:', wallet.isConnected);
    console.log('   - publicKey:', wallet.publicKey?.toString());
    
    // Test 4: Try to connect
    console.log('5. Testing connection...');
    wallet.connect()
      .then(response => {
        console.log('✅ Connection successful!');
        console.log('   Response:', response);
        console.log('   Address:', response.publicKey.toString());
      })
      .catch(error => {
        console.log('❌ Connection failed:', error.message);
      });
  } else {
    console.log('❌ No wallet found for testing');
    console.log('📥 Please install:');
    console.log('   - Phantom: https://phantom.app/');
    console.log('   - Solflare: https://solflare.com/');
  }
}

console.log('🏁 Test complete. Check results above.');