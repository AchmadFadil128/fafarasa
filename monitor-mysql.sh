#!/bin/bash

# Script monitoring untuk MySQL lokal
echo "=== Monitoring MySQL Lokal ==="

# Cek status MySQL service
echo "1. Status MySQL Service:"
sudo systemctl status mysql --no-pager -l

echo -e "\n2. MySQL Process:"
ps aux | grep mysql | grep -v grep

echo -e "\n3. MySQL Connections:"
mysql -u fafarasa -pfafarasa -e "SHOW PROCESSLIST;" 2>/dev/null || echo "Tidak bisa connect ke MySQL"

echo -e "\n4. Database Size:"
mysql -u fafarasa -pfafarasa -e "
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'fafarasa'
GROUP BY table_schema;" 2>/dev/null || echo "Tidak bisa connect ke MySQL"

echo -e "\n5. Recent MySQL Logs (last 10 lines):"
sudo tail -10 /var/log/mysql/error.log 2>/dev/null || echo "Log file tidak ditemukan"

echo -e "\n6. Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

echo -e "\n=== Monitoring selesai ===" 