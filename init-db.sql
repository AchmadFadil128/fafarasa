-- Initialize database and user permissions
CREATE DATABASE IF NOT EXISTS fafarasa;
CREATE USER IF NOT EXISTS 'fafarasa'@'%' IDENTIFIED BY 'fafarasa';
GRANT ALL PRIVILEGES ON fafarasa.* TO 'fafarasa'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE fafarasa; 