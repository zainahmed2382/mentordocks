import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma Migrate requires a direct (non-pooled) connection.
    // The pooled DATABASE_URL is used only in the PrismaClient constructor (via adapter).
    url: env("DIRECT_URL"),
  },
});
