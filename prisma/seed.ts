import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user if not exists
  const existingAdmin = await prisma.adminUser.findFirst()
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin', 12)
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    })
    console.log('Default admin user created (username: admin, password: admin)')
  } else {
    console.log('Admin user already exists')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
