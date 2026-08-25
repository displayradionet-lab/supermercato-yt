import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

export default prisma;