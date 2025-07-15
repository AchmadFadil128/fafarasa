#!/bin/bash

# Script untuk restore database dari backup
BACKUP_DIR="./backups"

echo "=== Restore Database Fafa Rasa ==="

# Cek apakah direktori backup ada
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory tidak ditemukan: $BACKUP_DIR"
    exit 1
fi

# Tampilkan backup yang tersedia
echo "Backup files yang tersedia:"
ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null | nl || echo "Tidak ada file backup"

# Minta user pilih file backup
echo -e "\nMasukkan nomor file backup yang ingin di-restore (atau tekan Enter untuk file terbaru):"
read -r choice

if [ -z "$choice" ]; then
    # Pilih file terbaru
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
else
    # Pilih berdasarkan nomor
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | sed -n "${choice}p")
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: File backup tidak ditemukan"
    exit 1
fi

echo "File yang akan di-restore: $BACKUP_FILE"

# Konfirmasi restore
echo -e "\nPERINGATAN: Restore akan menghapus semua data yang ada!"
echo "Apakah Anda yakin ingin melanjutkan? (y/N)"
read -r confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Restore dibatalkan"
    exit 0
fi

# Backup database saat ini sebelum restore
echo "Creating backup dari database saat ini..."
CURRENT_BACKUP="$BACKUP_DIR/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u fafarasa -pfafarasa fafarasa > "$CURRENT_BACKUP"

# Restore database
echo "Restoring database..."
gunzip -c "$BACKUP_FILE" | mysql -u fafarasa -pfafarasa fafarasa

if [ $? -eq 0 ]; then
    echo "Restore berhasil!"
    echo "Backup database lama tersimpan di: $CURRENT_BACKUP"
else
    echo "Restore gagal!"
    echo "Mencoba restore dari backup database lama..."
    mysql -u fafarasa -pfafarasa fafarasa < "$CURRENT_BACKUP"
    echo "Database dikembalikan ke state sebelum restore"
    exit 1
fi

echo "=== Restore selesai ===" 