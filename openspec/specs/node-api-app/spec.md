# Spec: Node API App

## Purpose

Defines the NestJS HTTP API app (`apps/api`) as a first-class Turborepo workspace within the monorepo.

## Requirements

### Requirement: NestJS API Workspace

The system SHALL include a NestJS HTTP API app as a first-class Turborepo workspace.

#### Scenario: Workspace is installed

- **WHEN** dependencies are installed from the repo root
- **THEN** `apps/api` SHALL be available as workspace package `@repo/api`
- **AND** the package SHALL use the existing Bun workspace setup

#### Scenario: Turbo targets the API app

- **WHEN** a developer runs Turbo tasks with `--filter=@repo/api`
- **THEN** the API app SHALL support `dev`, `build`, `lint`, `typecheck`, and `test` tasks

### Requirement: Vitest-Based Testing

The API app SHALL use Vitest for tests instead of Nest's default Jest setup.

#### Scenario: API app tests run

- **WHEN** the API app test task runs
- **THEN** tests SHALL execute with Vitest
- **AND** the app SHALL NOT require Jest configuration or Jest dependencies

### Requirement: API App Runtime

The API app SHALL run as a NestJS HTTP server using the default Express platform.

#### Scenario: API app starts without explicit port

- **WHEN** the app starts without `PORT`
- **THEN** it SHALL listen on port `3002`

#### Scenario: API app starts with explicit port

- **WHEN** the app starts with `PORT` set
- **THEN** it SHALL listen on the configured port

### Requirement: Health Endpoint

The API app SHALL expose a health endpoint for readiness checks.

#### Scenario: Health endpoint is requested

- **WHEN** a client sends `GET /health`
- **THEN** the API app SHALL respond successfully
- **AND** the response SHALL include a JSON health status

### Requirement: Shared Prisma Integration

The API app SHALL access Prisma through the existing shared database singleton.

#### Scenario: API app needs database access

- **WHEN** an API controller or service needs Prisma
- **THEN** it SHALL receive Prisma through a Nest injectable provider
- **AND** the provider SHALL wrap `@repo/shared/features/database`
- **AND** the API app SHALL NOT instantiate `PrismaClient` directly

#### Scenario: Database health is requested

- **WHEN** a client requests database health from the API app
- **THEN** the API app SHALL execute a lightweight Prisma query
- **AND** the response SHALL indicate database connectivity
- **AND** the response SHALL NOT expose business-domain records or private data

#### Scenario: Default API tests run

- **WHEN** the API app's default test task runs
- **THEN** Prisma dependencies SHALL be mocked where database behavior is tested
- **AND** the tests SHALL NOT require a live PostgreSQL instance

#### Scenario: Existing Prisma usage remains

- **WHEN** Prisma integration is added to the Nest API app
- **THEN** existing `@repo/api-client` direct Prisma calls SHALL remain unchanged
- **AND** no Prisma schema, migration, or seed changes SHALL be required

### Requirement: Isolated Nest TypeScript Configuration

The API app SHALL use app-local TypeScript settings required by NestJS.

#### Scenario: API app is typechecked

- **WHEN** the API app typecheck task runs
- **THEN** Nest decorators SHALL typecheck correctly
- **AND** root frontend TypeScript defaults SHALL NOT need to change

#### Scenario: API app is built

- **WHEN** the API app build task runs
- **THEN** compiled output SHALL be emitted to `dist`
- **AND** test files SHALL be excluded from build output
