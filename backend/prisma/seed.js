/**
 * Seed script — creates the default admin account.
 * Run once after migration: node prisma/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@billflow.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin already exists:', email);
    return;
  }

  const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const password = await bcrypt.hash(rawPassword, 10);
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      password,
      phone: '0000000000',
      shopName: 'BillFlow Admin',
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Admin created:', email, '/', rawPassword);
  console.log('⚠️  Change the password before deploying to production!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
