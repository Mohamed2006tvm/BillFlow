/**
 * Update script — synchronizes the admin account with credentials in .env.
 * Run after changing ADMIN_EMAIL or ADMIN_PASSWORD in .env:
 * node prisma/update-admin.js
 */
console.log('ℹ️ Script started...');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('ℹ️ Dotenv loaded.');
const { PrismaClient } = require('@prisma/client');
console.log('ℹ️ Prisma Client required.');
const bcrypt = require('bcryptjs');
console.log('ℹ️ Bcrypt required.');

const prisma = new PrismaClient();
console.log('ℹ️ Prisma instance created.');

async function main() {
  console.log('ℹ️ Main function started...');
  const email = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!email || !rawPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    process.exit(1);
  }

  console.log('ℹ️ Connecting to database...');
  // Find the single admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });
  console.log('ℹ️ Query finished.');

  if (!adminUser) {
    console.log('ℹ️ No admin found. Creating one...');
    const password = await bcrypt.hash(rawPassword, 10);
    console.log('ℹ️ Hashed password.');
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
    console.log('ℹ️ Hashed password.');
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
