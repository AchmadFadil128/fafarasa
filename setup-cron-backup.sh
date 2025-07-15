#!/bin/bash

# Script untuk setup backup otomatis dengan cron
echo "=== Setup Backup Otomatis ==="

# Dapatkan path absolut dari script backup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-db.sh"

# Buat cron job untuk backup harian jam 2 pagi
CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> $SCRIPT_DIR/backup.log 2>&1"

echo "Setting up daily backup at 2:00 AM..."
echo "Cron job: $CRON_JOB"

# Tambahkan ke crontab
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "Cron job added successfully!"
echo "Backup will run daily at 2:00 AM"
echo "Logs will be saved to: $SCRIPT_DIR/backup.log"

# Cek crontab
echo -e "\nCurrent crontab:"
crontab -l

echo -e "\n=== Setup selesai ===" 