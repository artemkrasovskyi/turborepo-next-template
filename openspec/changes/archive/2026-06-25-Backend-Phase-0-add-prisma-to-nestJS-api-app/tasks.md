## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Backend-Phase-0-add-prisma-to-nestJS-api-app --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Workspace Dependencies

- [x] 2.1 Add `@repo/shared` as a workspace dependency of `@repo/api`
- [x] 2.2 Ensure `@repo/api` does not add a direct `@prisma/client` dependency unless already inherited through shared package usage
- [x] 2.3 Do not add Prisma schema, migration, or seed changes

## 3. API App Implementation

- [x] 3.1 Add a Nest Prisma provider that wraps the shared `prisma` export from `@repo/shared/features/database`
- [x] 3.2 Register the Prisma provider in the API app module
- [x] 3.3 Add database health behavior using a lightweight Prisma query
- [x] 3.4 Ensure health responses do not expose business-domain records or private data
- [x] 3.5 Add OpenSpec traceability annotations to the Prisma provider and any modified health service/controller

## 4. Tests

- [x] 4.1 Add Vitest coverage for the Prisma provider using a mocked `@repo/shared/features/database`
- [x] 4.2 Add Vitest coverage for database health success and failure behavior
- [x] 4.3 Keep default tests independent from a live PostgreSQL instance

## 5. Verification

- [x] 5.1 Run `bunx turbo typecheck --filter=@repo/api`
- [x] 5.2 Run `bunx turbo lint --filter=@repo/api`
- [x] 5.3 Run `bunx turbo test --filter=@repo/api`
- [x] 5.4 Run `bunx turbo build --filter=@repo/api`
- [x] 5.5 With PostgreSQL running and Prisma Client generated, start the API app and verify the database health behavior
