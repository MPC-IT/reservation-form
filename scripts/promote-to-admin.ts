// scripts/promote-to-admin.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  try {
    // Update the first user (your account) to admin
    const result = await prisma.user.update({
      where: { id: 1 },
      data: { role: 'admin' },
    });
    console.log('User updated to admin:', result);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
