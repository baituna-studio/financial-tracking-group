# Financial App by Group

Aplikasi keuangan berbasis grup untuk mengelola pemasukan dan pengeluaran dengan fitur kolaborasi tim.

## 🌐 Demo

**Live Demo:** [https://financial-app-seven-teal.vercel.app/](https://financial-app-seven-teal.vercel.app/)

## ✨ Fitur Utama

### 📊 Dashboard
- **Ringkasan Keuangan**: Total pemasukan, pengeluaran, dan sisa budget
- **Pie Chart Visualisasi**: Grafik lingkaran untuk pengeluaran dan pemasukan per kategori
- **Filter Bulanan**: Pemilihan periode dengan custom month start day
- **Export Data**: Export laporan ke Excel
- **Transaksi Terbaru**: Daftar 5 transaksi terakhir

### 💰 Manajemen Keuangan
- **Pemasukan & Pengeluaran**: Input dan kelola transaksi keuangan
- **Kategori**: Kategorisasi transaksi dengan warna dan ikon
- **Filter Bulanan**: Tampilkan data sesuai periode yang dipilih
- **Custom Month Start**: Pengaturan awal bulan sesuai kebutuhan (misal: 25 setiap bulan)

### 👥 Sistem Grup
- **Kolaborasi Tim**: Kelola keuangan bersama dalam grup
- **Invite Member**: Undang anggota baru ke grup
- **Leave Group**: Keluar dari grup tanpa menghapus grup
- **Multi-Grup**: Satu user bisa bergabung dengan beberapa grup

### 📋 Kategori
- **Tipe Kategori**: Pemasukan dan Pengeluaran
- **Visual Kategori**: Warna dan ikon untuk setiap kategori
- **Statistik**: Total transaksi dan jumlah per kategori
- **Modal Transaksi**: Lihat detail transaksi per kategori
- **CRUD Operations**: Tambah, edit, hapus kategori

### ⚙️ Pengaturan
- **Profil User**: Update informasi profil
- **Month Start Day**: Atur awal bulan (1-31)
- **Export All Data**: Export semua data ke Excel dengan multiple sheets
- **Logout**: Keluar dari aplikasi

### 📱 Responsive Design
- **Mobile First**: Optimized untuk mobile dan desktop
- **Bottom Navigation**: Navigasi di bawah untuk mobile
- **Sidebar**: Sidebar untuk desktop
- **Adaptive Layout**: Layout yang menyesuaikan ukuran layar

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Excel Export**: XLSX
- **Deployment**: Vercel

## 🚀 Instalasi

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### Setup

1. **Clone repository**
```bash
git clone https://github.com/your-username/financial-app-group.git
cd financial-app-group
```

2. **Install dependencies**
```bash
npm install
# atau
yarn install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan konfigurasi Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup database**
Jalankan script SQL di Supabase SQL Editor:
```sql
-- Jalankan script dari folder scripts/
-- 01-create-tables.sql
-- 02-create-indexes.sql
-- dst...
```

5. **Run development server**
```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
financial-app-group/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── categories/        # Categories management
│   ├── finance/          # Income & expense management
│   ├── groups/           # Group management
│   └── settings/         # User settings
├── components/           # Reusable components
│   ├── ui/              # Shadcn/ui components
│   ├── layout/          # Layout components
│   └── modals/          # Modal components
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
├── scripts/             # Database migration scripts
└── public/              # Static assets
```

## 🔧 Konfigurasi Database

### Tables
- `profiles` - User profiles
- `groups` - Financial groups
- `user_groups` - User-group relationships
- `categories` - Transaction categories
- `expenses` - Expense transactions
- `budgets` - Income transactions (using budgets table)
- `invites` - Group invitations

### Row Level Security (RLS)
Semua tabel menggunakan RLS untuk keamanan data:
- User hanya bisa akses data grup yang diikutinya
- Data terisolasi per grup

## 📊 Fitur Export

### Export Dashboard
- Export data pengeluaran terbaru ke Excel
- Format: Judul, Kategori, Jumlah, Tanggal

### Export All Data
- Multi-sheet Excel file
- Sheets: Pemasukan & Pengeluaran, Kategori, Grup, Profil
- Data terurut berdasarkan tanggal dan waktu pembuatan

## 🎨 UI Components

Menggunakan Shadcn/ui untuk konsistensi design:
- Cards, Buttons, Modals
- Forms dengan validasi
- Charts dan visualisasi
- Responsive navigation

## 🔐 Authentication

- **Sign Up**: Registrasi user baru
- **Sign In**: Login dengan email/password
- **Session Management**: Otomatis dengan Supabase
- **Protected Routes**: Halaman terproteksi

## 📱 Responsive Features

### Mobile
- Bottom navigation bar
- Full-screen modals
- Touch-friendly buttons
- Optimized layouts

### Desktop
- Sidebar navigation
- Multi-column layouts
- Hover effects
- Keyboard shortcuts

## 🚀 Deployment

### Vercel (Recommended)
1. Connect repository ke Vercel
2. Set environment variables
3. Deploy otomatis

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Untuk pertanyaan atau dukungan:
- Email: support@financial-app.com
- Issues: [GitHub Issues](https://github.com/your-username/financial-app-group/issues)

---

**Financial App by Group** - Kelola keuangan tim dengan mudah dan efisien! 💰✨
