# MoBoy Web3 - Cloudflare Pages Configuration

## Build Configuration
- **Framework**: Next.js 14
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: `18.x` atau `20.x`

## Environment Variables
```
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your-nextauth-secret
DATABASE_URL=your-database-url
```

## Cloudflare Pages Setup Steps

### 1. Login ke Cloudflare Dashboard
1. Buka https://dash.cloudflare.com/
2. Login dengan akun Cloudflare Anda

### 2. Setup Cloudflare Pages
1. Klik "Pages" di sidebar kiri
2. Klik "Create a project"
3. Connect ke GitHub repository Anda

### 3. Build Settings
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: /
```

### 4. Environment Variables
Tambahkan environment variables berikut:
- `NODE_ENV=production`
- `NEXTAUTH_URL=https://your-domain.pages.dev`
- `NEXTAUTH_SECRET=generate-random-secret`

## Static Export Configuration
Karena Cloudflare Pages lebih optimal dengan static files, kita perlu mengkonfigurasi Next.js untuk static export.