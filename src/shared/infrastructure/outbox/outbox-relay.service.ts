import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { AGGREGATE_TYPE_TO_TOPIC } from '../kafka/kafka-topics.constants';
import { KafkaService } from '../kafka/kafka.service';

const POLL_INTERVAL_MS = 1000;
const BATCH_SIZE = 100;
const MAX_RETRIES = 5;

@Injectable()
export class OutboxRelayService {
    private readonly logger = new Logger(OutboxRelayService.name);
    private isProcessing = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly kafka: KafkaService,
    ) {}

    @Interval(POLL_INTERVAL_MS)
    async processOutboxEvents(): Promise<void> {
        // Guard: @Interval() fires on a fixed wall-clock timer — if the previous batch
        // takes longer than POLL_INTERVAL_MS, a second execution would overlap.
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            await this.claimAndProcess();
        } finally {
            this.isProcessing = false;
        }
    }

    private async claimAndProcess(): Promise<void> {
        // Atomically claim a batch: PENDING → PROCESSING in one transaction.
        // SELECT FOR UPDATE SKIP LOCKED means: if another relay instance already
        // holds a lock on a row, skip it rather than waiting. This is the canonical
        // PostgreSQL pattern for safe concurrent job queues.
        const claimed = await this.prisma.$transaction(async (tx) => {
            const rows = await tx.$queryRaw<{ id: string }[]>`
                SELECT id FROM outbox_events
                WHERE status = 'PENDING'
                ORDER BY "createdAt" ASC
                LIMIT ${BATCH_SIZE}
                FOR UPDATE SKIP LOCKED
            `;

            if (rows.length === 0) return [];

            const ids = rows.map((r) => r.id);
            await tx.outboxEvent.updateMany({
                where: { id: { in: ids } },
                data: { status: 'PROCESSING' },
            });

            return tx.outboxEvent.findMany({ where: { id: { in: ids } } });
            // Transaction commits here — locks are released. Kafka publishing happens outside
            // the transaction so a slow broker never holds DB locks open.
        });

        for (const event of claimed) {
            const topic = AGGREGATE_TYPE_TO_TOPIC[event.aggregateType];

            if (!topic) {
                this.logger.error(
                    `No Kafka topic registered for aggregateType '${event.aggregateType}'. Event ${event.id} cannot be published. Update AGGREGATE_TYPE_TO_TOPIC.`,
                );
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: {
                        status: 'FAILED',
                        failureCount: event.failureCount + 1,
                        lastError: `No topic registered for aggregateType: ${event.aggregateType}`,
                    },
                });
                continue;
            }

            try {
                await this.kafka.produce({
                    topic,
                    messages: [
                        {
                            key: event.aggregateId, // partition key — all events for a given task
                            // go to the same partition, preserving order
                            value: JSON.stringify({
                                eventId: event.id,
                                eventType: event.eventType,
                                aggregateId: event.aggregateId,
                                aggregateType: event.aggregateType,
                                occurredAt: event.createdAt.toISOString(),
                                payload: event.payload,
                            }),
                            headers: {
                                'event-type': event.eventType, // consumers can filter by header
                                'aggregate-type': event.aggregateType, // without deserialising the body
                            },
                        },
                    ],
                });

                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: {
                        status: 'PROCESSED',
                        processedAt: new Date(),
                    },
                });
            } catch (error) {
                const err = error as Error;
                const newFailureCount = event.failureCount + 1;
                const isDead = newFailureCount >= MAX_RETRIES;

                this.logger.error(
                    `Outbox relay failed for event ${event.id} (${event.eventType}) — attempt ${newFailureCount}/${MAX_RETRIES}`,
                    err.stack,
                );

                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: {
                        status: isDead
                            ? 'FAILED'
                            : 'PENDING',
                        failureCount: newFailureCount,
                        lastError: err.message,
                    },
                });

                if (isDead) {
                    // Hook for alerting (Datadog, PagerDuty, Sentry, etc.)
                    this.logger.error(
                        `DEAD LETTER: event ${event.id} (${event.eventType}) exceeded ${MAX_RETRIES} retries. Manual intervention required.`,
                    );
                }
            }
        }
    }
}
