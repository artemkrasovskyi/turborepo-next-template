## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Backend-Phase-0-add-nestJS-api-app --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Workspace Scaffold

- [x] 2.1 Create `apps/api/package.json` with package name `@repo/api`
- [x] 2.2 Add Nest runtime dependencies: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`
- [x] 2.3 Add dev dependencies: `@nestjs/cli`, `@nestjs/testing`, `@types/node`, `vitest`
- [x] 2.4 Do not add Jest dependencies or Nest default Jest configuration
- [x] 2.5 Add `nest-cli.json`
- [x] 2.6 Add Nest-specific `tsconfig.json` and `tsconfig.build.json`

## 3. API App Implementation

- [x] 3.1 Add `src/main.ts` to bootstrap `AppModule` and listen on `PORT ?? 3002`
- [x] 3.2 Add `src/app.module.ts`
- [x] 3.3 Add `src/app.controller.ts` with `GET /health`
- [x] 3.4 Add `src/app.service.ts` for health response logic
- [x] 3.5 Add OpenSpec traceability annotations to entry point, controller, and service

## 4. Tests and Documentation

- [x] 4.1 Add a Vitest unit test for the health service or controller
- [x] 4.2 Ensure tests import Vitest APIs explicitly, for example from `vitest`
- [x] 4.3 Update `README.md` structure and run instructions to include `apps/api` on port `3002`
- [x] 4.4 Run `bun install` to update the lockfile

## 5. Verification

- [x] 5.1 Run `bunx turbo typecheck --filter=@repo/api`
- [x] 5.2 Run `bunx turbo lint --filter=@repo/api`
- [x] 5.3 Run `bunx turbo test --filter=@repo/api`
- [x] 5.4 Run `bunx turbo build --filter=@repo/api`
- [x] 5.5 Start the API app and verify `GET http://localhost:3002/health`
