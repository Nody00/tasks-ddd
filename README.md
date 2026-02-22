# Everything API

A NestJS REST API built to practice **Clean Architecture** and **Clean Code** principles (Uncle Bob). Every implementation decision prioritises production quality: strict typing, layered architecture, atomic event delivery, and rate limiting.

## What's in here

| Concept | Implementation |
|---|---|
| Clean Architecture | Strict dependency rule enforced by ESLint — domain never imports framework code |
| Domain Events | Events raised by entities, not use cases; carry full before/after snapshots |
| Transactional Outbox | Atomic DB write + event record in one Prisma transaction; relay publishes to Kafka |
| Soft Delete | Status transition to `DELETED` — rows are never physically removed |
| Rate Limiting | Per-endpoint write throttling backed by Redis |
| API Docs | Scalar UI at `/reference`, powered by OpenAPI/Swagger |

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (runs PostgreSQL, Redis, Kafka)

## Getting started

**First time:**
```bash
pnpm install
pnpm dev:setup
```

`dev:setup` generates the Prisma client, starts Docker services, waits for all three to be healthy, resets the database, and starts the app in watch mode.

**Subsequent runs:**
```bash
pnpm dev
```

Starts Docker services (if not already running) and launches the app in watch mode.

**Reset everything** (drops all data):
```bash
pnpm dev:clean
```

## Environment

Create `.env` at the project root:
```
DATABASE_URL=postgresql://everything_user:everything_password@localhost:5432/everything_api
KAFKA_BROKERS=localhost:9092
```

## API

The app runs on **http://localhost:3000** by default.

| Method | Path | Description |
|---|---|---|
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | List all tasks |
| `GET` | `/tasks/:id` | Get a task by ID |
| `PATCH` | `/tasks/:id` | Update title and/or description |
| `PATCH` | `/tasks/:id/status` | Transition task status |
| `DELETE` | `/tasks/:id` | Soft-delete a task (status → `DELETED`) |

**Interactive docs:** http://localhost:3000/reference

### Task status transitions

```
OPEN → IN_PROGRESS → DONE
  ↓         ↓          ↓
        DELETED
```

### Rate limits

Write endpoints (`POST`, `PATCH`, `DELETE`) are throttled. Limits are backed by Redis so they survive app restarts and work across multiple instances.

## Architecture

```
src/
  shared/
    domain/events/         ← IDomainEvent interface (zero NestJS imports)
    infrastructure/
      kafka/               ← KafkaService — producer, consumer, topic admin
      outbox/              ← OutboxRelayService — polls DB, publishes to Kafka
  tasks/
    domain/
      entity/              ← Task entity — raises domain events on every mutation
      events/              ← TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent, etc.
      exceptions/          ← TaskNotFoundException, InvalidStatusTransitionException
    application/
      ports/               ← TaskRepository interface
      use-cases/           ← One class per use case, one execute() method
    infrastructure/
      controllers/         ← Thin HTTP layer — translates requests to use case calls
      event-handlers/      ← Kafka consumer — logs events, ready for side effects
      persistance/         ← PrismaTaskRepository — atomic save + outbox write
```

### Event flow

```
HTTP request
    │
    ▼
Use case calls task.someMethod()
    │  entity raises domain events internally
    ▼
taskRepository.save(task)
    │  Prisma $transaction:
    │    1. upsert task row
    │    2. insert outbox_events rows (status: PENDING)
    ▼
outbox_events table
    │
    ▼  polled every 1s by OutboxRelayService
Kafka — topic: task-events (keyed by task ID)
    │
    ▼
TaskEventsConsumerService — logs event, ready for side effects
```

### Why the outbox pattern?

Writing to the database and then publishing to Kafka are two separate operations. If the app crashes between them, one side is updated and the other isn't — a consistency bug. The outbox pattern solves this by writing the event record to the **same database transaction** as the business data change. A background relay then reads from the outbox and publishes to Kafka. The database is the source of truth for delivery status.

## Commands

| Command | Description |
|---|---|
| `pnpm dev:setup` | First-time setup (Docker + DB reset + app start) |
| `pnpm dev` | Start app in watch mode |
| `pnpm dev:clean` | Tear down Docker volumes (wipes data) |
| `pnpm build` | Compile to `dist/` |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm lint` | Lint and auto-fix |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm format` | Format with Prettier |

## Infrastructure

All services run via Docker Compose:

| Service | Image | Port |
|---|---|---|
| PostgreSQL | postgres:17-alpine | 5432 |
| Redis | redis:8-alpine | 6379 |
| Kafka | apache/kafka:3.8.1 (KRaft) | 9092 |

Kafka runs in **KRaft mode** — no Zookeeper required.
