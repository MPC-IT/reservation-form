import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@multipointcom.com' },
    update: {},
    create: {
      email: 'admin@multipointcom.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      active: true,
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10);
  
  const staff = await prisma.user.upsert({
    where: { email: 'staff@multipointcom.com' },
    update: {},
    create: {
      email: 'staff@multipointcom.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'staff',
      active: true,
    },
  });

  // Create some sample companies
  const company1 = await prisma.company.upsert({
    where: { name: 'Acme Corporation' },
    update: {},
    create: {
      name: 'Acme Corporation',
    },
  });

  const company2 = await prisma.company.upsert({
    where: { name: 'Tech Industries' },
    update: {},
    create: {
      name: 'Tech Industries',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin login: admin@multipointcom.com / admin123');
  console.log('Staff login: staff@multipointcom.com / staff123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
