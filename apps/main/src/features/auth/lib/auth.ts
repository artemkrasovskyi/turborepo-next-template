import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@repo/shared/features/database';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      name: 'displayName',
      image: 'avatarUrl',
    },
    additionalFields: {
      username: {
        type: 'string',
        required: true,
      },
      bio: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [nextCookies()],
});
