## 1. OpenSpec Validation

- [ ] 1.1 Create the OpenSpec change files
- [ ] 1.2 Run `openspec validate Backend-Phase-1-search-module --strict`
- [ ] 1.3 Do not begin implementation until the change has been reviewed

## 2. API Module

- [ ] 2.1 Add `apps/api/src/features/search/search.module.ts`
- [ ] 2.2 Add `SearchService` using `PrismaService`
- [ ] 2.3 Add `SearchController` exposing `GET /search/users`
- [ ] 2.4 Register `SearchModule` in `AppModule`
- [ ] 2.5 Add `@repo/types` as an `@repo/api` dependency if response types are imported from the shared types package
- [ ] 2.6 Add OpenSpec traceability annotations to the search controller and service

## 3. Search Behavior

- [ ] 3.1 Trim `query`; return `{ items: [], nextCursor: null }` for empty queries
- [ ] 3.2 Search `username` and `displayName` with case-insensitive `contains`
- [ ] 3.3 Use default limit `20` and cap requested limits at `20`
- [ ] 3.4 Support cursor pagination by user `id`
- [ ] 3.5 Return only `id`, `username`, `displayName`, `avatarUrl`, and `isFollowing`
- [ ] 3.6 Batch follow-state lookup when `viewerId` is provided
- [ ] 3.7 Keep existing frontend `/explore` and `@repo/api-client/features/search` behavior unchanged

## 4. Tests

- [ ] 4.1 Test query trimming and empty query response
- [ ] 4.2 Test Prisma search arguments for username/display-name matching
- [ ] 4.3 Test pagination and `nextCursor`
- [ ] 4.4 Test optional `viewerId` follow-state batching
- [ ] 4.5 Test private fields are not returned
- [ ] 4.6 Keep tests mocked and independent from live PostgreSQL

## 5. Verification

- [ ] 5.1 Run `bunx turbo typecheck --filter=@repo/api`
- [ ] 5.2 Run `bunx turbo lint --filter=@repo/api`
- [ ] 5.3 Run `bunx turbo test --filter=@repo/api`
- [ ] 5.4 Run `bunx turbo build --filter=@repo/api`
- [ ] 5.5 Start the API app and manually verify `GET /search/users?query=<text>`
