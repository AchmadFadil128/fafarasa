# Setup Autentikasi Fafarasa

## Overview
Sistem autentikasi menggunakan NextAuth v5 beta dengan Credentials Provider (username + password) dan database MySQL menggunakan Prisma ORM.

## Fitur
- ✅ Login dengan username dan password
- ✅ Password di-hash menggunakan bcrypt
- ✅ Role-based access (ADMIN/USER)
- ✅ JWT session strategy
- ✅ Protected routes dengan middleware
- ✅ Auto-redirect ke dashboard setelah login
- ✅ Logout functionality

## Setup

### 1. Environment Variables
Buat file `.env` dari `env.example` dan update dengan konfigurasi Anda:

```bash
cp env.example .env
```

Update file `.env` dengan:
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migration (jika database sudah ada)
npx prisma migrate dev --name add_user_login

# Atau jalankan script setup otomatis
./setup-auth.sh
```

### 4. Jalankan Setup Script
```bash
# Buat user admin dan setup database
node scripts/setup-auth.js
```

### 5. Start Development Server
```bash
npm run dev
```

## Struktur Database

### Tabel UserLogin
```sql
CREATE TABLE UserLogin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER') DEFAULT 'USER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Default Credentials
Setelah setup, Anda bisa login dengan:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

## File Structure
```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth configuration
│   ├── login/page.tsx                    # Login page
│   ├── dashboard/page.tsx                # Protected dashboard
│   └── layout.tsx                        # Root layout with SessionProvider
├── components/
│   ├── Providers.tsx                     # SessionProvider wrapper
│   └── LogoutButton.tsx                  # Logout component
├── types/
│   └── next-auth.d.ts                    # NextAuth type definitions
└── middleware.ts                          # Route protection
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Protected Routes
Semua route kecuali `/login` dan `/` memerlukan autentikasi.

## Security Features
- Password hashing dengan bcrypt (salt rounds: 10)
- JWT tokens untuk session management
- Protected routes dengan middleware
- Role-based access control

## Troubleshooting

### Database Connection Issues
1. Pastikan MySQL server berjalan
2. Check `DATABASE_URL` di file `.env`
3. Pastikan database dan user sudah dibuat

### Migration Issues
Jika ada masalah dengan migration:
```bash
# Reset database (HATI-HATI: akan menghapus semua data)
npx prisma migrate reset

# Atau buat migration manual
npx prisma db push
```

### NextAuth Issues
1. Check `NEXTAUTH_SECRET` sudah diset
2. Pastikan `NEXTAUTH_URL` sesuai dengan environment
3. Restart development server setelah update environment variables

## Production Deployment
1. Update `NEXTAUTH_URL` dengan domain production
2. Generate strong `NEXTAUTH_SECRET`
3. Update `DATABASE_URL` dengan database production
4. Pastikan HTTPS enabled untuk production

## Support
Jika ada masalah, check:
1. Console browser untuk error client-side
2. Terminal server untuk error server-side
3. Database logs untuk connection issues
4. NextAuth logs untuk authentication issues
