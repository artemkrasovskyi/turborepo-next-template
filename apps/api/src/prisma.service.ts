/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-prisma-to-nestJS-api-app
 */
import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/shared/features/database';

@Injectable()
export class PrismaService {
  readonly client = prisma;
}
