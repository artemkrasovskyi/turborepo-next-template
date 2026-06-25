/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-1-search-module
 */
import { Controller, Get, Query } from '@nestjs/common';
import type { FollowListPage } from '@repo/types/features/follow';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  async searchUsers(
    @Query('query') query: string = '',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('viewerId') viewerId?: string,
  ): Promise<FollowListPage> {
    return this.searchService.searchUsers({
      query,
      cursor,
      limit: limit !== undefined ? parseInt(limit, 10) : undefined,
      viewerId,
    });
  }
}
