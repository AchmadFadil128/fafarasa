# Fafa Rasa - Cake Management System

Ini adalah proyek [Next.js](https://nextjs.org) untuk mengatur stok dan penjualan kue.

## Features

- Manajemen produksi
- Tracking stok kue
- Pencatatan masuk dan keluar kue
- Peforma produsen kue

## Quick Start dengan Docker dan Lokal MySQL

Saya memakai MySQL lokal agar database lebih aman jika sesuatu terjadi pada kontainer. Kedepannya projek ini akan berbasis microservices.

### Syarat
- Docker
- Docker Compose
- MySQL Server (installasi lokal)

### Memakai Docker Compose

1. **Buat file docker-compose.yaml**
```bash
version: '3.8'

services:
  web:
    image: achmad/fafarasa:latest
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - "8832:3000" #port 8832 bisa diganti
    networks:
      - default
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    extra_hosts:
      - "host.docker.internal:host-gateway"

networks:
  default:
    driver: bridge
```

2. **Buat file .env**
```bash
# Database Configuration
DATABASE_URL="mysql://fafarasa:fafarasa@host.docker.internal:3306/fafarasa"

# Username dan password database bisa disesuaikan, jika belum membuat database, lihat bagian bawah readme.

# NextAuth Configuration
NEXTAUTH_SECRET="Bebas, tapi saya sangat merekomendasikan membuat kunci dari https://generate-secret.vercel.app/32"
NEXTAUTH_URL="Url yang akan digunakan untuk mengakses app"
# Admin Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Environment
NODE_ENV="production"
```

3. ****
```bash
docker-compose up --build -d
```

4. **Akses ke aplikasi**
- Buka [http://localhost:8832](http://localhost:8832) di browser.


## Prisma - Menyiapkan Database MySQL Secara Lokal

1. Buat terlebih dahulu databasenya
```bash
sudo mysql -e "
CREATE DATABASE IF NOT EXISTS fafarasa;
CREATE USER IF NOT EXISTS 'fafarasa'@'localhost' IDENTIFIED BY 'fafarasa';
CREATE USER IF NOT EXISTS 'fafarasa'@'%' IDENTIFIED BY 'fafarasa';
GRANT ALL PRIVILEGES ON fafarasa.* TO 'fafarasa'@'localhost';
GRANT ALL PRIVILEGES ON fafarasa.* TO 'fafarasa'@'%';
FLUSH PRIVILEGES;
```
Default user dan password databasenya adalah fafarasa.

2. Lakukan konfigurasi agar dapat menerima koneksi dari Docker
```bash
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
```

# Setup automatic backup (cron job)
```
# Add to crontab: 0 2 * * * /path/to/fafarasa/backup-db.sh
```
## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Protected Routes
Semua route kecuali `/login` memerlukan autentikasi.

## Security Features
- Password hashing dengan bcrypt (salt rounds: 10)
- JWT tokens untuk session management
- Protected routes dengan middleware
- Role-based access control