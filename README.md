# Fafa Rasa - Cake Management System

This is a [Next.js](https://nextjs.org) project for managing cake inventory and sales tracking.

## Features

- Producer management
- Cake inventory tracking
- Daily stock entries
- Sales analytics
- PDF report generation

## Quick Start with Docker + Local MySQL

### Prerequisites
- Docker
- Docker Compose
- MySQL Server (local installation)

### Deployment

1. **Clone the repository**
```bash
git clone <repository-url>
cd fafarasa
```

2. **Setup MySQL Local (First time only)**
```bash
# Setup MySQL lokal di VPS
chmod +x setup-mysql-local.sh
./setup-mysql-local.sh
```

3. **Deploy with Docker Compose**
```bash
# Option 1: Use the deployment script (recommended)
chmod +x deploy-local-mysql.sh
./deploy-local-mysql.sh

# Option 2: Manual deployment
docker-compose up --build -d
```

4. **Access the application**
- Open [http://localhost:8832](http://localhost:8832) in your browser
- The application will be ready automatically with database migrations applied

### Database Migration (If needed)

If you have existing data in container MySQL:

```bash
# Backup dan migrasi data
chmod +x migrate-data.sh
./migrate-data.sh
```

## Development

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Database Management

The application uses MySQL with Prisma ORM. Database migrations are automatically applied during deployment.

## Maintenance

### Database Backup
```bash
# Manual backup
chmod +x backup-db.sh
./backup-db.sh

# Setup automatic backup (cron job)
# Add to crontab: 0 2 * * * /path/to/fafarasa/backup-db.sh
```

### Monitoring
```bash
# Check MySQL status
chmod +x monitor-mysql.sh
./monitor-mysql.sh
```

## Troubleshooting

### Database Issues
- If MySQL service is down:
```bash
sudo systemctl status mysql
sudo systemctl restart mysql
```

### Container Issues
- If the web container can't connect to MySQL:
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check MySQL binding
sudo grep bind-address /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart MySQL
sudo systemctl restart mysql
```

### Reset Everything
```bash
docker-compose down
docker system prune -f
./deploy-local-mysql.sh
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
