/**
 * Update script — synchronizes the admin account with credentials in .env.
 * Run after changing ADMIN_EMAIL or ADMIN_PASSWORD in .env:
 * node prisma/update-admin.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!email || !rawPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    process.exit(1);
  }

  // Find the single admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!adminUser) {
    console.log('ℹ️ No admin found. Creating one...');
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
    console.log('✅ Admin created:', email);
  } else {
    console.log('ℹ️ Updating existing admin:', adminUser.email);
    const password = await bcrypt.hash(rawPassword, 10);
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        email,
        password,
      },
    });
    console.log('✅ Admin updated to:', email);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error updating admin:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
