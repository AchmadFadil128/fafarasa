# Panduan Migrasi: Container MySQL ke MySQL Lokal VPS

## Overview
Aplikasi Fafa Rasa ERP telah dimigrasikan dari menggunakan MySQL container ke MySQL lokal di VPS untuk mengatasi masalah stabilitas container yang sering berhenti.

## Keuntungan Migrasi
1. **Stabilitas**: MySQL lokal lebih stabil dan tidak akan berhenti tiba-tiba
2. **Performa**: Akses langsung ke database tanpa overhead container
3. **Maintenance**: Lebih mudah untuk backup dan maintenance
4. **Resource**: Menggunakan resource VPS secara optimal

## Langkah-langkah Migrasi

### 1. Setup MySQL Lokal di VPS
```bash
# Jalankan script setup MySQL
./setup-mysql-local.sh
```

### 2. Backup Data (Jika Ada)
```bash
# Jika container MySQL masih berjalan dan ada data penting
./migrate-data.sh
```

### 3. Update Konfigurasi
File `docker-compose.yml` sudah diupdate untuk menggunakan MySQL lokal:
- Container MySQL dihapus
- Web service menggunakan `host.docker.internal:3306`
- Menambahkan `extra_hosts` untuk akses ke host

### 4. Deploy Aplikasi
```bash
# Deploy dengan konfigurasi baru
./deploy-local-mysql.sh
```

## Konfigurasi Database

### Environment Variables
```bash
# Untuk production di VPS
DATABASE_URL="mysql://fafarasa:fafarasa@host.docker.internal:3306/fafarasa"

# Untuk development lokal
DATABASE_URL="mysql://fafarasa:fafarasa@localhost:3306/fafarasa"
```

### Database Credentials
- **Database**: `fafarasa`
- **User**: `fafarasa`
- **Password**: `fafarasa`
- **Host**: `localhost` (atau IP VPS)
- **Port**: `3306`

## Troubleshooting

### 1. Container Tidak Bisa Akses MySQL Lokal
```bash
# Pastikan MySQL berjalan
sudo systemctl status mysql

# Cek binding address
sudo grep bind-address /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart MySQL jika perlu
sudo systemctl restart mysql
```

### 2. Permission Denied
```bash
# Cek user permissions
sudo mysql -e "SHOW GRANTS FOR 'fafarasa'@'%';"

# Recreate user jika perlu
sudo mysql -e "
DROP USER IF EXISTS 'fafarasa'@'%';
CREATE USER 'fafarasa'@'%' IDENTIFIED BY 'fafarasa';
GRANT ALL PRIVILEGES ON fafarasa.* TO 'fafarasa'@'%';
FLUSH PRIVILEGES;
"
```

### 3. Firewall Issues
```bash
# Pastikan port 3306 terbuka untuk Docker
sudo ufw allow 3306
```

## Monitoring dan Maintenance

### Backup Database
```bash
# Backup otomatis
mysqldump -u fafarasa -pfafarasa fafarasa > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Monitoring MySQL
```bash
# Cek status MySQL
sudo systemctl status mysql

# Cek log MySQL
sudo tail -f /var/log/mysql/error.log
```

## Rollback (Jika Diperlukan)
Jika ingin kembali ke container MySQL:

1. Restore `docker-compose.yml` lama
2. Jalankan `docker-compose up -d`
3. Import data dari backup

## Kesimpulan
Migrasi ke MySQL lokal akan memberikan stabilitas dan performa yang lebih baik untuk aplikasi Fafa Rasa ERP. Pastikan untuk melakukan backup regular dan monitoring database. 