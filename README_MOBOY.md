# MoBoy - Web3 Content Platform

Platform Web3 yang kompatibel dengan Cloudflare untuk submit konten dan earning dengan meme coin dari pump.fun.

## 🚀 Features

### 1. Wallet Connection
- Koneksi dompet crypto sebagai login user
- Support MetaMask dan wallet Ethereum-compatible lainnya
- Auto-generate demo address untuk testing

### 2. Dashboard dengan 3 Tab

#### Tab 1: Home
- Desain seperti Google dengan form submit sederhana
- Tombol "Submit Here" untuk submit link konten
- Branding MoBoy dengan karakter cow cartoon

#### Tab 2: Content List
- Daftar semua link konten yang disubmit
- Alamat wallet yang bisa di-copy
- Jumlah view per konten
- Link langsung ke konten dengan tracking view

#### Tab 3: Leaderboard
- Peringkat penghasilan user
- Total konten dan views per user
- Display earnings dalam SOL

### 3. Smart Contract Integration
- Kontrak meme coin: `6aUG5S4YCyy4MWH6rtkDuF8fmYwwwPyKq4MypCCQpump`
- Platform: pump.fun
- Support balance check dan token info

### 4. Database Schema
- Users: wallet address, name, profile, earnings
- Contents: link, wallet address, view count
- Earnings: user earnings tracking

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (untuk development, mudah di-migrate ke PostgreSQL)
- **Web3**: Ethers.js, WalletConnect
- **State Management**: Zustand
- **Deployment**: Cloudflare compatible

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
```

### Database Setup
```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate
```

## 🚀 Deployment ke Cloudflare

Platform ini dirancang untuk kompatibel dengan Cloudflare:

1. **Build untuk production**:
```bash
npm run build
```

2. **Upload ke Cloudflare Pages**:
- Upload folder `.next`
- Set environment variables
- Deploy sebagai static site dengan API routes

3. **Database**:
- Untuk production, migrasi ke Cloudflare D1 atau external database
- Update `DATABASE_URL` environment variable

## 📱 API Endpoints

### Contents
- `GET /api/contents` - Get all contents
- `POST /api/contents` - Submit new content
- `POST /api/contents/[id]/view` - Track content view

### Users
- `GET /api/users` - Get leaderboard
- `POST /api/users` - Create/update user

### Pump.fun Integration
- `GET /api/pumpfun` - Get token info
- `POST /api/pumpfun` - Check balance, token info

## 🎨 UI Components

Menggunakan shadcn/ui components:
- Tabs untuk navigation
- Cards untuk content display
- Avatar untuk user profile
- Badge untuk wallet address
- Input form untuk submit link
- ScrollArea untuk list display

## 🔐 Security Features

- Wallet-based authentication
- Input validation
- SQL injection prevention dengan Prisma ORM
- XSS protection dengan Next.js defaults

## 🎯 How to Use

1. **Connect Wallet**: Klik tombol "Connect Wallet" di header
2. **Submit Content**: Masukkan link konten di tab Home
3. **View Contents**: Lihat semua konten di tab Content List
4. **Track Earnings**: Monitor peringkat di tab Leaderboard

## 🐄 MoBoy Branding

- Logo: Cartoon cow character (black & white spots)
- Colors: Primary theme dengan accent colors
- Style: Playful dan user-friendly

## 🔄 Future Enhancements

- Real-time updates dengan WebSocket
- Advanced analytics dashboard
- Content categorization
- Multi-wallet support
- Mobile app version

## 📄 License

MIT License - feel free to use and modify.