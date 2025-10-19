# 🧪 Simple Wallet Connection Test

## 📋 Step-by-Step Testing Guide

### 1. **Install Wallet Extension**
Pilih salah satu:
- **Phantom**: https://phantom.app/ (Recommended)
- **Solflare**: https://solflare.com/

### 2. **Setup Wallet**
1. Install extension di browser (Chrome/Firefox/Brave)
2. Create new wallet atau import existing
3. **IMPORTANT**: Set network ke **Mainnet Beta**
4. Unlock wallet (masukkan password)

### 3. **Test Connection**

#### Method A: Using the App
1. Buka aplikasi MoBoy
2. Klik tombol **"Test"** (untuk debugging)
3. Klik tombol **"Connect"**
4. Approve connection di wallet popup
5. Check jika address muncul

#### Method B: Browser Console Test
1. Buka browser console (F12 → Console tab)
2. Copy paste script ini:
```javascript
// Simple wallet test
console.log('🧪 Testing wallet...');
console.log('Phantom:', !!window.solana?.isPhantom);
console.log('Solflare:', !!window.solflare);
console.log('Connected:', !!window.solana?.isConnected);

// Test connection
if (window.solana?.isPhantom) {
  window.solana.connect().then(r => {
    console.log('✅ Connected:', r.publicKey.toString());
  }).catch(e => console.log('❌ Error:', e.message));
}
```
3. Tekan Enter
4. Approve connection di wallet
5. Check hasil di console

## 🔍 Expected Results

### ✅ Success Indicators:
- Console menunjukkan "✅ Connected: [address]"
- UI menunjukkan "Wallet Connected" dengan address
- Address format: 44 karakter alphanumeric
- Tidak ada error messages

### ❌ Failure Indicators:
- "No wallet found" message
- "Connection rejected" message
- Error di console
- Address tidak muncul

## 🛠️ Troubleshooting

### Problem: "No wallet found"
**Solution:**
1. Refresh browser setelah install wallet
2. Check extension enabled di browser
3. Install wallet yang benar (Phantom/Solflare)

### Problem: "Connection rejected"
**Solution:**
1. Check wallet popup (mungkin tersembunyi)
2. Klik "Connect" di wallet popup
3. Coba lagi setelah approve

### Problem: "Invalid address"
**Solution:**
1. Ensure wallet set ke **Mainnet Beta**
2. Disconnect dan reconnect wallet
3. Check wallet has SOL balance

### Problem: Nothing happens when clicking Connect
**Solution:**
1. Open browser console (F12)
2. Check untuk error messages
3. Refresh page dan coba lagi
4. Try different browser

## 📱 Browser Compatibility

### ✅ Works Best:
- Chrome (recommended)
- Brave
- Firefox

### ⚠️ May Have Issues:
- Safari (limited support)
- Mobile browsers

## 🔧 Manual Testing Steps

### Step 1: Verify Installation
```javascript
// Di browser console
console.log('Phantom installed:', !!window.solana?.isPhantom);
console.log('Solflare installed:', !!window.solflare);
```

### Step 2: Test Connection
```javascript
// Test Phantom
if (window.solana?.isPhantom) {
  window.solana.connect()
    .then(r => console.log('Success:', r.publicKey.toString()))
    .catch(e => console.log('Error:', e.message));
}
```

### Step 3: Verify Address
```javascript
// Check if address is valid
if (window.solana?.publicKey) {
  const address = window.solana.publicKey.toString();
  console.log('Address:', address);
  console.log('Length:', address.length); // Should be 44
}
```

## 🚨 Common Mistakes

1. **Forgot to refresh browser** after installing wallet
2. **Wrong network** (must be Mainnet Beta)
3. **Wallet locked** (need to unlock first)
4. **Popup blocked** (check browser popup settings)
5. **Extension disabled** (check browser extensions)

## 📞 If Still Not Working

1. **Clear browser cache** and restart browser
2. **Disable other wallet extensions** temporarily
3. **Try incognito/private mode**
4. **Use different browser** (Chrome recommended)
5. **Reinstall wallet extension**

---

## 🎯 Quick Test Checklist

- [ ] Wallet extension installed
- [ ] Browser refreshed
- [ ] Wallet unlocked
- [ ] Network = Mainnet Beta
- [ ] Click "Test" button → shows wallet info
- [ ] Click "Connect" button → wallet popup appears
- [ ] Approve connection → address appears
- [ ] Can copy address
- [ ] Can disconnect successfully

If all checkboxes are checked, wallet connection is working! 🎉