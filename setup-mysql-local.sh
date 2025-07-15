#!/bin/bash

# Script untuk setup MySQL lokal di VPS
# Jalankan script ini di VPS sebelum menjalankan aplikasi

echo "=== Setup MySQL Lokal untuk Fafa Rasa ERP ==="

# Update package list
echo "Updating package list..."
sudo apt update

# Install MySQL Server
echo "Installing MySQL Server..."
sudo apt install -y mysql-server

# Start dan enable MySQL service
echo "Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
echo "Securing MySQL installation..."
sudo mysql_secure_installation

# Create database and user
echo "Creating database and user..."
sudo mysql -e "
CREATE DATABASE IF NOT EXISTS fafarasa;
CREATE USER IF NOT EXISTS 'fafarasa'@'localhost' IDENTIFIED BY 'fafarasa';
CREATE USER IF NOT EXISTS 'fafarasa'@'%' IDENTIFIED BY 'fafarasa';
GRANT ALL PRIVILEGES ON fafarasa.* TO 'fafarasa'@'localhost';
GRANT ALL PRIVILEGES ON fafarasa.* TO 'fafarasa'@'%';
FLUSH PRIVILEGES;
"

# Configure MySQL to accept connections from Docker
echo "Configuring MySQL to accept Docker connections..."
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart MySQL
echo "Restarting MySQL..."
sudo systemctl restart mysql

echo "=== Setup selesai! ==="
echo "MySQL sudah siap digunakan dengan:"
echo "- Database: fafarasa"
echo "- User: fafarasa"
echo "- Password: fafarasa"
echo "- Host: localhost (atau IP VPS)"
echo "- Port: 3306" 