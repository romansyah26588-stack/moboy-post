# 🔧 Wallet Connection Troubleshooting Guide

## 📋 Quick Testing Steps

### 1. **Install Wallet Extension**
- **Phantom**: https://phantom.app/
- **Solflare**: https://solflare.com/

### 2. **Configure Wallet**
- Set network to **Mainnet Beta**
- Create/import wallet
- Ensure wallet is unlocked

### 3. **Test Connection**
1. Open browser console (F12)
2. Look for debug messages starting with `=== WALLET DEBUG INFO ===`
3. Click "Connect Wallet" button

## 🔍 Debug Information

### Console Logs to Check:
```
=== WALLET DEBUG INFO ===
Window object: object
Phantom installed: true/false
Phantom connected: true/false
Phantom public key: [address]
Solflare installed: true/false
Solflare connected: true/false
Solflare public key: [address]
========================
```

### Success Messages:
```
✅ Phantom wallet connected successfully!
Address: [44-character address]
Balance: [amount] SOL
```

### Error Messages:
```
❌ No Solana wallet detected!
❌ Wallet connection failed
Failed to connect to Phantom wallet: [error]
```

## 🛠️ Common Issues & Solutions

### Issue 1: "No wallet found"
**Cause**: No wallet extension installed
**Solution**: 
1. Install Phantom or Solflare
2. Refresh the page
3. Try connecting again

### Issue 2: "Connection failed"
**Causes**:
- Wallet is locked
- Network not set to Mainnet Beta
- Extension permissions denied

**Solutions**:
1. Unlock your wallet
2. Check network settings (must be Mainnet Beta)
3. Allow extension permissions for the site
4. Refresh page and try again

### Issue 3: "Invalid wallet address"
**Cause**: Address validation failed
**Solution**:
1. Ensure wallet is on Solana Mainnet Beta
2. Try disconnecting and reconnecting
3. Check if wallet has SOL balance

### Issue 4: "Auto-connect not working"
**Cause**: Wallet not connected from previous session
**Solution**:
1. Manually click "Connect Wallet"
2. Check if wallet is unlocked
3. Ensure wallet allows auto-connection

## 🧪 Testing Checklist

### Before Testing:
- [ ] Wallet extension installed
- [ ] Browser refreshed after installation
- [ ] Wallet unlocked
- [ ] Network set to Mainnet Beta
- [ ] Console open for debugging

### Connection Test:
- [ ] Click "Connect Wallet" button
- [ ] Check console for debug messages
- [ ] Approve connection in wallet popup
- [ ] Verify address appears in UI
- [ ] Check balance display

### Features Test:
- [ ] Copy address functionality
- [ ] Open in Solana Explorer
- [ ] Disconnect functionality
- [ ] Reconnect after disconnect

## 📱 Browser Compatibility

### ✅ Supported:
- Chrome/Chromium (recommended)
- Firefox
- Brave
- Edge

### ⚠️ May have issues:
- Safari (limited wallet support)
- Mobile browsers (use wallet apps instead)

## 🔐 Security Notes

1. **Always verify** the domain before connecting
2. **Never share** your private key or seed phrase
3. **Check the connection** request details in wallet
4. **Use official** wallet extensions only

## 🚀 Advanced Debugging

### Manual Wallet Check:
Open browser console and run:
```javascript
// Check Phantom
console.log('Phantom:', window.solana?.isPhantom);
console.log('Connected:', window.solana?.isConnected);
console.log('Address:', window.solana?.publicKey?.toString());

// Check Solflare
console.log('Solflare:', window.solflare);
console.log('Connected:', window.solflare?.isConnected);
console.log('Address:', window.solflare?.publicKey?.toString());
```

### Network Check:
```javascript
// Verify Solana connection
const connection = new Connection('https://api.mainnet-beta.solana.com');
connection.getLatestBlockhash().then(hash => {
  console.log('✅ Solana network reachable:', hash);
}).catch(err => {
  console.error('❌ Solana network error:', err);
});
```

## 📞 Support

If you're still having issues:

1. **Check console logs** for specific error messages
2. **Try a different browser** (Chrome recommended)
3. **Disable other wallet extensions** temporarily
4. **Clear browser cache** and retry
5. **Contact support** with console error details

---

*Last updated: Current session*
*Tested with: Phantom v1.17.0+, Solflare v1.5.0+*