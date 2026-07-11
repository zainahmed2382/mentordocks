import { PrismaClient } from '@prisma/client';

let prismaClientInstance: any = null;

function getPrismaClient(): any {
  if (prismaClientInstance !== null) {
    return prismaClientInstance;
  }
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('DATABASE_URL is not configured in environment variables.');
      prismaClientInstance = false;
      return null;
    }

    // Try standard PrismaClient initialization first, fallback gracefully
    prismaClientInstance = new PrismaClient();
    return prismaClientInstance;
  } catch (err) {
    console.error('Failed to initialize PrismaClient:', err);
    prismaClientInstance = false;
    return null;
  }
}

// Lazy safe proxy so module import never crashes the Vercel serverless function
export const prisma = new Proxy({}, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (!client || typeof client[prop] !== 'function' && !client[prop]) {
      // Return a safe dummy mock for Prisma model calls when DB is not configured
      return new Proxy({}, {
        get(_modelTarget, method) {
          return async (..._args: any[]) => {
            if (method === 'findMany') return [];
            if (method === 'findUnique' || method === 'findFirst') return null;
            if (method === 'create' || method === 'update' || method === 'delete') return null;
            return null;
          };
        }
      });
    }
    return client[prop];
  }
}) as any;
