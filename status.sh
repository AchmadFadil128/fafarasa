#!/bin/bash

# Script untuk menampilkan status lengkap sistem Fafa Rasa ERP
echo "=== Status Sistem Fafa Rasa ERP ==="
echo "Tanggal: $(date)"
echo ""

# 1. Status Docker containers
echo "1. DOCKER CONTAINERS:"
echo "===================="
docker-compose ps
echo ""

# 2. Status MySQL
echo "2. MYSQL STATUS:"
echo "==============="
sudo systemctl status mysql --no-pager -l | head -10
echo ""

# 3. Database connection test
echo "3. DATABASE CONNECTION:"
echo "======================"
if mysql -u fafarasa -pfafarasa -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✓ Database connection: OK"
    
    # Cek tabel
    TABLE_COUNT=$(mysql -u fafarasa -pfafarasa -e "SHOW TABLES;" 2>/dev/null | wc -l)
    echo "✓ Tables found: $((TABLE_COUNT - 1))"
    
    # Cek ukuran database
    DB_SIZE=$(mysql -u fafarasa -pfafarasa -e "
    SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
    FROM information_schema.tables 
    WHERE table_schema = 'fafarasa';" 2>/dev/null | tail -1)
    echo "✓ Database size: ${DB_SIZE} MB"
else
    echo "✗ Database connection: FAILED"
fi
echo ""

# 4. Application logs (last 5 lines)
echo "4. APPLICATION LOGS (Last 5 lines):"
echo "==================================="
docker-compose logs --tail=5 web 2>/dev/null || echo "No logs available"
echo ""

# 5. System resources
echo "5. SYSTEM RESOURCES:"
echo "==================="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | head -1
echo "Memory Usage:"
free -h | grep Mem | awk '{print $3 "/" $2 " (" $3/$2 * 100.0 "%)"}'
echo "Disk Usage:"
df -h / | tail -1 | awk '{print $5 " of " $2 " (" $3 "/" $2 " used)"}'
echo ""

# 6. Backup status
echo "6. BACKUP STATUS:"
echo "================"
BACKUP_DIR="./backups"
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(ls "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
    
    echo "✓ Backup directory: exists"
    echo "✓ Total backups: $BACKUP_COUNT"
    
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d' ' -f1)
        echo "✓ Latest backup: $BACKUP_DATE"
    else
        echo "✗ No backup files found"
    fi
else
    echo "✗ Backup directory: not found"
fi
echo ""

# 7. Network connectivity
echo "7. NETWORK CONNECTIVITY:"
echo "======================="
if curl -s http://localhost:8832 >/dev/null 2>&1; then
    echo "✓ Application: accessible at http://localhost:8832"
else
    echo "✗ Application: not accessible"
fi

if mysql -u fafarasa -pfafarasa -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✓ Database: accessible"
else
    echo "✗ Database: not accessible"
fi
echo ""

echo "=== Status check selesai ===" 