/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-prisma-to-nestJS-api-app
 */
import { Controller, Get } from '@nestjs/common';
import { AppService, HealthResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async getHealth(): Promise<HealthResponse> {
    return this.appService.getHealth();
  }
}
