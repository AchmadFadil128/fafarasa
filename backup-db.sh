#!/bin/bash

# Script backup otomatis untuk database fafarasa
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fafarasa_backup_$DATE.sql"

echo "=== Backup Database Fafa Rasa ==="

# Buat direktori backup jika belum ada
mkdir -p $BACKUP_DIR

# Backup database
echo "Creating backup: $BACKUP_FILE"
mysqldump -u fafarasa -pfafarasa fafarasa > "$BACKUP_DIR/$BACKUP_FILE"

# Cek apakah backup berhasil
if [ $? -eq 0 ]; then
    echo "Backup berhasil: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress backup file
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Hapus backup lama (lebih dari 7 hari)
    find $BACKUP_DIR -name "fafarasa_backup_*.sql.gz" -mtime +7 -delete
    echo "Old backups (older than 7 days) cleaned up"
    
    # Tampilkan ukuran backup
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo "Backup gagal!"
    exit 1
fi

echo "=== Backup selesai ===" 