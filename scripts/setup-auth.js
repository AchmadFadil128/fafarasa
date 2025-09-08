const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAuth() {
  try {
    console.log('Setting up authentication...');
    
    // Create admin user from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin user already exists
    const existingAdmin = await prisma.userLogin.findUnique({
      where: { username: adminUsername }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const adminUser = await prisma.userLogin.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    });
    
    console.log('Default credentials:');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('Error setting up authentication:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAuth();
