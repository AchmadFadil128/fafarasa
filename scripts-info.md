# Daftar Script Fafa Rasa ERP

## Setup Scripts

### `setup-mysql-local.sh`
**Tujuan**: Setup MySQL lokal di VPS
**Fungsi**:
- Install MySQL Server
- Konfigurasi database dan user
- Setup permissions untuk Docker
- Konfigurasi binding address

**Cara pakai**:
```bash
chmod +x setup-mysql-local.sh
./setup-mysql-local.sh
```

### `setup-cron-backup.sh`
**Tujuan**: Setup backup otomatis harian
**Fungsi**:
- Menambahkan cron job untuk backup harian jam 2 pagi
- Backup akan disimpan di folder `./backups/`
- Log backup disimpan di `backup.log`

**Cara pakai**:
```bash
chmod +x setup-cron-backup.sh
./setup-cron-backup.sh
```

## Deployment Scripts

### `deploy-local-mysql.sh`
**Tujuan**: Deploy aplikasi dengan MySQL lokal
**Fungsi**:
- Stop container lama
- Build dan start aplikasi baru
- Cek status deployment

**Cara pakai**:
```bash
chmod +x deploy-local-mysql.sh
./deploy-local-mysql.sh
```

## Database Scripts

### `migrate-data.sh`
**Tujuan**: Migrasi data dari container MySQL ke MySQL lokal
**Fungsi**:
- Backup data dari container (jika masih berjalan)
- Import data ke MySQL lokal
- Menyimpan backup file

**Cara pakai**:
```bash
chmod +x migrate-data.sh
./migrate-data.sh
```

### `backup-db.sh`
**Tujuan**: Backup database manual
**Fungsi**:
- Backup database fafarasa
- Compress file backup
- Hapus backup lama (>7 hari)
- Tampilkan ukuran backup

**Cara pakai**:
```bash
chmod +x backup-db.sh
./backup-db.sh
```

### `restore-db.sh`
**Tujuan**: Restore database dari backup
**Fungsi**:
- Tampilkan daftar backup yang tersedia
- Pilih file backup untuk restore
- Backup database saat ini sebelum restore
- Restore database dengan konfirmasi

**Cara pakai**:
```bash
chmod +x restore-db.sh
./restore-db.sh
```

## Monitoring Scripts

### `monitor-mysql.sh`
**Tujuan**: Monitoring MySQL lokal
**Fungsi**:
- Cek status MySQL service
- Tampilkan MySQL processes
- Cek koneksi database
- Tampilkan ukuran database
- Cek MySQL logs
- Tampilkan disk usage

**Cara pakai**:
```bash
chmod +x monitor-mysql.sh
./monitor-mysql.sh
```

### `status.sh`
**Tujuan**: Status lengkap sistem
**Fungsi**:
- Status Docker containers
- Status MySQL service
- Test koneksi database
- Application logs
- System resources (CPU, Memory, Disk)
- Backup status
- Network connectivity

**Cara pakai**:
```bash
chmod +x status.sh
./status.sh
```

## Workflow Lengkap

### Setup Awal (First Time)
1. `./setup-mysql-local.sh` - Setup MySQL lokal
2. `./migrate-data.sh` - Migrasi data (jika ada)
3. `./deploy-local-mysql.sh` - Deploy aplikasi
4. `./setup-cron-backup.sh` - Setup backup otomatis

### Maintenance Rutin
1. `./status.sh` - Cek status sistem
2. `./monitor-mysql.sh` - Monitoring MySQL
3. `./backup-db.sh` - Backup manual (jika perlu)

### Troubleshooting
1. `./status.sh` - Diagnosa masalah
2. `./monitor-mysql.sh` - Cek MySQL
3. `./restore-db.sh` - Restore jika ada masalah data

## File Konfigurasi

### `docker-compose.yml`
- Konfigurasi Docker untuk aplikasi
- Menggunakan MySQL lokal via `host.docker.internal:3306`

### `env.example`
- Template environment variables
- Konfigurasi database untuk development dan production

### `MIGRATION_GUIDE.md`
- Panduan lengkap migrasi
- Troubleshooting guide
- Maintenance procedures 