/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-prisma-to-nestJS-api-app
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface HealthResponse {
  status: string;
  database: string;
}

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHealth(): Promise<HealthResponse> {
    try {
      await this.prismaService.client.$queryRawUnsafe('SELECT 1');
      return { status: 'ok', database: 'ok' };
    } catch {
      return { status: 'ok', database: 'error' };
    }
  }
}
