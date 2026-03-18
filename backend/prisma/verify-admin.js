const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('❌ User not found:', email);
    return;
  }

  const isValid = await bcrypt.compare(rawPassword, user.password);
  console.log('Verification for', email);
  console.log('Password is valid:', isValid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
