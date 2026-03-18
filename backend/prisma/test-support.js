const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.supportTicket.count();
    console.log('SupportTicket table exists. Count:', count);
  } catch (err) {
    console.error('SupportTicket table does NOT exist or error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
