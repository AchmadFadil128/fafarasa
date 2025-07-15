#!/bin/bash

# Script untuk migrasi data dari container MySQL ke MySQL lokal
# Jalankan script ini jika Anda ingin memindahkan data yang sudah ada

echo "=== Migrasi Data dari Container ke MySQL Lokal ==="

# Backup data dari container (jika masih berjalan)
echo "Creating backup from container..."
docker exec fafarasa_db mysqldump -u fafarasa -pfafarasa fafarasa > backup_fafarasa.sql

# Import data ke MySQL lokal
echo "Importing data to local MySQL..."
mysql -u fafarasa -pfafarasa fafarasa < backup_fafarasa.sql

echo "=== Migrasi selesai! ==="
echo "Data telah dipindahkan ke MySQL lokal"
echo "File backup tersimpan sebagai: backup_fafarasa.sql" 