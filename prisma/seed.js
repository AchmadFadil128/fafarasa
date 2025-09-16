/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding authentication data...');

  // Gunakan nilai default 'admin' dan 'admin123
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const existing = await prisma.userLogin.findUnique({
    where: { username: adminUsername },
  }).catch((err) => {
    console.error('Error querying UserLogin. Did you run migrations?');
    throw err;
  });

  if (existing) {
    console.log('Admin user already exists');
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.userLogin.create({
    data: {
      username: adminUsername,
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created with default credentials:');
  console.log(`Username: ${adminUsername}`);
  console.log(`Password: ${adminPassword}`);
  console.log('Please change these credentials after first login!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });