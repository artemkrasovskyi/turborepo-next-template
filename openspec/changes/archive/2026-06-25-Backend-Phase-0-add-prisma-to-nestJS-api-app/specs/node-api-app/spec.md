## ADDED Requirements

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
