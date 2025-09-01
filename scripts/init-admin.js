const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initAdmin() {
  try {
    // Check if admin credentials already exist
    const existing = await prisma.adminCredentials.findFirst()
    if (existing) {
      console.log('Admin credentials already exist')
      return
    }

    // Create default admin credentials
    const hashedPassword = await bcrypt.hash('admin', 12)
    await prisma.adminCredentials.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    })

    console.log('Admin credentials initialized successfully')
    console.log('Default username: admin')
    console.log('Default password: admin')
    console.log('Please change these credentials after first login')
  } catch (error) {
    console.error('Error initializing admin credentials:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initAdmin()
