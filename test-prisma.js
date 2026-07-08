import { PrismaClient } from '@prisma/client';

try {
  const prisma = new PrismaClient({
    datasourceUrl: "postgresql://user:pass@localhost/db"
  });
  console.log("Success with datasourceUrl");
} catch (e) {
  console.error("Failed:", e.message);
}
