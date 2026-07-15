import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

function createSafePrisma() {
  const noop = async () => undefined;

  return {
    audit: {
      create: async () => ({ id: 'offline-audit', createdAt: new Date().toISOString() }),
      findMany: async () => [],
      findUnique: async () => null,
    },
    user: {
      create: async () => ({ id: 'offline-user' }),
      findUnique: async () => null,
    },
    $connect: noop,
    $disconnect: noop,
  };
}

const connectionString = process.env.DATABASE_URL;
let prisma: any;

if (!connectionString) {
  console.warn('DATABASE_URL is not set; using offline-safe fallback for auth and audit persistence.');
  prisma = createSafePrisma();
} else {
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } catch (error) {
    console.warn('Prisma initialization failed, using offline-safe fallback:', error);
    prisma = createSafePrisma();
  }
}

export { prisma };
