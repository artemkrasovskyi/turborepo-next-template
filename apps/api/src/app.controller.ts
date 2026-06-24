/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-nestJS-api-app
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
