# Task Management API

## About
A NestJS task management API built as a learning exercise for Uncle Bob's **Clean Code** and **Clean Architecture** principles. The goal is to practice layered architecture, SOLID principles, dependency inversion, and clean coding practices.

## Tech Stack
- **Framework:** NestJS 11 + TypeScript 5.7
- **Package Manager:** pnpm
- **Testing:** Jest 30 + ts-jest (unit tests + e2e with supertest)
- **Linting:** ESLint 9 (flat config) + Prettier (single quotes, trailing commas)

## Commands
- `pnpm start:dev` — run in dev mode with watch
- `pnpm test` — run unit tests
- `pnpm test:watch` — run tests in watch mode
- `pnpm test:e2e` — run e2e tests
- `pnpm lint` — lint and auto-fix
- `pnpm build` — compile to dist/

## Architecture (Clean Architecture)
The project follows Clean Architecture with the dependency rule — dependencies only point inward:

```
src/tasks/
  domain/          ← Entities & domain exceptions (zero framework imports)
  application/     ← Use cases & ports (depends only on domain)
  infrastructure/  ← Controllers, persistence adapters (depends on application + domain)
  task.module.ts   ← Composition root (NestJS wiring)
```

### Rules
- `domain/` must have ZERO imports from `@nestjs/*`, `application/`, or `infrastructure/`
- `application/` must have ZERO imports from `@nestjs/*` or `infrastructure/`
- Use cases depend on port interfaces, never on concrete implementations
- Controllers are thin — they translate HTTP ↔ use case input/output, nothing more
- Business logic lives in entities and use cases, never in controllers

## Conventions
- One use case per class with an `execute()` method
- Domain exceptions extend plain `Error`, not NestJS `HttpException`
- Controllers catch domain exceptions and translate them to HTTP exceptions
- Repository interface (port) defined in `application/ports/`, implementations in `infrastructure/persistance/`

## Architecture Enforcement
ESLint `no-restricted-imports` rules in `eslint.config.mjs` automatically enforce the dependency rule:
- Files in `domain/` get lint errors if they import from `application/`, `infrastructure/`, or `@nestjs/*`
- Files in `application/` get lint errors if they import from `infrastructure/` or `@nestjs/*`
- Run `pnpm lint` to verify architecture compliance
