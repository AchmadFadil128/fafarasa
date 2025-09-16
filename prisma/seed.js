/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding authentication data...');

  // Nilai default hardcoded (tidak lagi menggunakan .env)
  const adminUsername = 'admin';
  const adminPassword = 'admin123';

  // Cek user ADMIN
  let existingAdmin;
  try {
    existingAdmin = await prisma.userLogin.findFirst({
      where: { role: 'ADMIN' },
    });
  } catch (err) {
    console.error('Error querying UserLogin. Did you run migrations?');
    throw err;
  }

  if (existingAdmin) {
    console.log('Ada user dengan role ADMIN. Seed dilewati (tidak menambah admin baru).');
    return;
  }

  // Buat user ADMIN
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
