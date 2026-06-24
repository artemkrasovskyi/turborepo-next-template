/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-nestJS-api-app
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
