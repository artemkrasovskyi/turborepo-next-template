import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// eslint-disable-next-line @typescript-eslint/dot-notation -- required by noPropertyAccessFromIndexSignature
if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
