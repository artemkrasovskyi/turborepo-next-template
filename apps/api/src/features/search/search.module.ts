/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-1-search-module
 */
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, PrismaService],
})
export class SearchModule {}
