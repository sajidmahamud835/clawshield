import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();

  try {
    const tasks = await prisma.task.findMany();
    console.log('Tasks:', tasks);
    console.log('✅ Prisma client direct test successful!');
  } catch (err) {
    console.error('❌ Prisma client direct test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
