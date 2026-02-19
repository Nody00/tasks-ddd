# Everything API

## About

A NestJS API built as a learning exercise for Uncle Bob's **Clean Code** and **Clean Architecture** principles. The goal is to practice layered architecture, SOLID principles, dependency inversion, and clean coding practices.

## Philosophy

- **Production-ready by default** — all implementations should follow production best practices (security, scalability, observability) even in a learning context. Cut corners on scope, not on quality.
- **Strict TypeScript** — proper typing is essential. Use explicit types, avoid `any`, leverage Express/NestJS types where applicable, and respect `strictNullChecks`. Type assertions are acceptable only when overriding framework base class signatures.
- **Version-aware implementations** — always verify guidance, APIs, and code examples against the actual package versions installed in this project (see Tech Stack below). Do not use deprecated APIs or patterns from older versions.

## Tech Stack

- **Framework:** NestJS 11 (`@nestjs/core@^11.0.1`) + TypeScript 5.7 (`^5.7.3`)
- **Package Manager:** pnpm
- **Testing:** Jest 30 (`^30.0.0`) + ts-jest (`^29.2.5`) (unit tests + e2e with supertest)
- **Linting:** ESLint 9 (`^9.18.0`, flat config) + Prettier (`^3.4.2`, single quotes, trailing commas, tab width 4)
- **Validation:** class-validator (`^0.14.3`) + class-transformer (`^0.5.1`)
- **API Docs:** @nestjs/swagger (`^11.2.6`) + Scalar UI (`@scalar/nestjs-api-reference@^1.0.23`, served at `/reference`)
- **Rate Limiting:** @nestjs/throttler (`^6.5.0`) + @nest-lab/throttler-storage-redis (`^1.2.0`) + ioredis (`^5.9.3`)
- **HTTP Platform:** @nestjs/platform-express (`^11.0.1`) + @types/express (`^5.0.0`)
- **Git Hooks:** Husky (`^9.1.7`, pre-push: lint + typecheck + format check)

## Commands

- `pnpm dev` — run in dev mode with watch
- `pnpm build` — compile to dist/
- `pnpm test` — run unit tests
- `pnpm test:watch` — run tests in watch mode
- `pnpm test:e2e` — run e2e tests
- `pnpm lint` — lint and auto-fix
- `pnpm typecheck` — type check without emitting
- `pnpm format` — format code with Prettier
- `pnpm format:check` — check formatting without writing

## Architecture (Clean Architecture)

The project follows Clean Architecture with the dependency rule — dependencies only point inward:

```
src/
  shared/
    domain/                ← Shared base classes (DomainException, error codes)
    infrastructure/        ← Shared infra (global DomainExceptionFilter)
  <feature>/               ← e.g. tasks/
    domain/
      entity/              ← Entities (zero framework imports)
      exceptions/          ← Domain exceptions extending DomainException
    application/
      ports/               ← Repository interfaces
      use-cases/           ← One class per use case with execute() method
    infrastructure/
      controllers/         ← REST controllers (thin — translate HTTP ↔ use cases)
        dtos/              ← Request/response DTOs (class-validator + @ApiProperty)
        mappers/           ← Static mapper classes (entity ↔ response DTO)
      persistance/         ← Repository implementations
    <feature>.module.ts    ← Composition root (NestJS wiring with factory providers)
```

### Dependency Rules

- `domain/` must have ZERO imports from `@nestjs/*`, `application/`, or `infrastructure/`
- `application/` must have ZERO imports from `@nestjs/*` or `infrastructure/`
- Use cases depend on port interfaces, never on concrete implementations
- Controllers are thin — they translate HTTP ↔ use case input/output, nothing more
- Business logic lives in entities and use cases, never in controllers

## Conventions

### Use Cases

- One use case per class with an `execute()` method
- Use cases accept plain objects or primitives as input, return domain entities

### Domain Exceptions

- Domain exceptions extend `DomainException` (in `shared/domain/exceptions/`) with a `DomainErrorCode`
- Global `DomainExceptionFilter` maps domain error codes to HTTP status codes (NOT_FOUND → 404, INVALID_OPERATION → 400)
- Domain exceptions never extend NestJS `HttpException`

### DTOs & Mappers

- DTOs live in `infrastructure/controllers/dtos/` — they are HTTP-specific
- Request DTOs use `class-validator` decorators (`@IsString`, `@IsNotEmpty`, `@IsEnum`, etc.)
- All DTO properties have explicit `@ApiProperty()` or `@ApiPropertyOptional()` decorators with `description` and `example`
- Response DTOs define the API contract; domain entities are never exposed directly in HTTP responses
- Mappers are static classes in `infrastructure/controllers/mappers/` that translate domain entities to response DTOs

### Controllers

- Decorated with `@ApiTags` for grouping
- Each endpoint has `@ApiOperation({ summary })` and appropriate `@Api*Response` decorators
- Endpoints with `:id` params use `@ApiParam`

### Repositories

- Interface (port) defined in `application/ports/`, implementations in `infrastructure/persistance/`

### Validation

- Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`

## Architecture Enforcement

ESLint `no-restricted-imports` rules in `eslint.config.mjs` automatically enforce the dependency rule:

- Files in `domain/` get lint errors if they import from `application/`, `infrastructure/`, or `@nestjs/*`
- Files in `application/` get lint errors if they import from `infrastructure/` or `@nestjs/*`
- Run `pnpm lint` to verify architecture compliance

## Git Hooks

Husky pre-push hook runs before every push:

```
pnpm lint && pnpm typecheck && pnpm format:check
```

All three must pass before code can be pushed to remote.

## Adding a New Feature Module

Follow the same structure as `tasks/`:

```
src/<feature>/
  domain/entity/
  domain/exceptions/
  application/ports/
  application/use-cases/
  infrastructure/controllers/
  infrastructure/controllers/dtos/
  infrastructure/controllers/mappers/
  infrastructure/persistance/
  <feature>.module.ts
```

Then import the module in `app.module.ts`.
