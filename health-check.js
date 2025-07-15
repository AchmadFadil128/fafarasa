const { PrismaClient } = require('@prisma/client');

async function healthCheck() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    console.log('🔍 Checking database tables...');
    const producers = await prisma.producer.findMany();
    console.log(`✅ Database is ready. Found ${producers.length} producers`);
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  healthCheck().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = healthCheck; 