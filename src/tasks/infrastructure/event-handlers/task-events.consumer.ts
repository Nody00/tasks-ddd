import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KAFKA_TOPICS } from 'src/shared/infrastructure/kafka/kafka-topics.constants';
import { KafkaService } from 'src/shared/infrastructure/kafka/kafka.service';

interface TaskSnapshot {
    id: string;
    title: string;
    description: string;
    status: string;
}

interface TaskEventPayload {
    before: TaskSnapshot | null; // null for task.created (entity did not exist before)
    after: TaskSnapshot | null; // null for task.deleted (entity no longer exists)
}

interface TaskEventMessage {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    occurredAt: string;
    payload: TaskEventPayload;
}

// Deduplicate Kafka's at-least-once delivery within one process lifetime.
// Bounded to MAX_DEDUP_SIZE — once full, the oldest entry is evicted (Set is insertion-ordered).
// For cross-restart durability, persist processed eventIds to a `processed_events` table (Inbox pattern).
const MAX_DEDUP_SIZE = 10_000;

@Injectable()
export class TaskEventsConsumerService implements OnModuleInit {
    private readonly logger = new Logger(TaskEventsConsumerService.name);
    private readonly processedEventIds = new Set<string>();

    constructor(private readonly kafkaService: KafkaService) {}

    async onModuleInit(): Promise<void> {
        await this.kafkaService.subscribe(
            [KAFKA_TOPICS.TASK_EVENTS],
            (_topic, message) => {
                const raw = message.value?.toString();
                if (!raw) return;

                let event: TaskEventMessage;
                try {
                    event = JSON.parse(raw) as TaskEventMessage;
                } catch {
                    // A malformed message is not recoverable — rethrowing would loop forever
                    // without advancing the Kafka offset. Log for forensics and skip.
                    this.logger.error(
                        'Failed to deserialise task event — skipping malformed message',
                        raw,
                    );
                    return;
                }

                if (this.isDuplicate(event.eventId)) {
                    this.logger.debug(
                        `Skipping duplicate event ${event.eventId} (${event.eventType})`,
                    );
                    return;
                }

                this.trackProcessed(event.eventId);
                this.handle(event);
            },
        );
    }

    private isDuplicate(eventId: string): boolean {
        return this.processedEventIds.has(eventId);
    }

    private trackProcessed(eventId: string): void {
        this.processedEventIds.add(eventId);
        if (this.processedEventIds.size > MAX_DEDUP_SIZE) {
            // Set maintains insertion order — .values().next().value is the oldest entry
            const oldest = this.processedEventIds.values().next()
                .value as string;
            this.processedEventIds.delete(oldest);
        }
    }

    private handle(event: TaskEventMessage): void {
        switch (event.eventType) {
            case 'task.created':
                this.onTaskCreated(event);
                break;
            case 'task.updated':
                this.onTaskUpdated(event);
                break;
            case 'task.status.updated':
                this.onTaskStatusUpdated(event);
                break;
            case 'task.deleted':
                this.onTaskDeleted(event);
                break;
            default:
                this.logger.warn(`Unhandled event type: ${event.eventType}`);
        }
    }

    private onTaskCreated(event: TaskEventMessage): void {
        this.logger.log(
            `[task.created] ${event.aggregateId} — after: ${JSON.stringify(event.payload.after)}`,
        );
    }

    private onTaskUpdated(event: TaskEventMessage): void {
        this.logger.log(
            `[task.updated] ${event.aggregateId} — before: ${JSON.stringify(event.payload.before)}, after: ${JSON.stringify(event.payload.after)}`,
        );
    }

    private onTaskStatusUpdated(event: TaskEventMessage): void {
        this.logger.log(
            `[task.status.updated] ${event.aggregateId} — ${event.payload.before?.status} → ${event.payload.after?.status}`,
        );
    }

    private onTaskDeleted(event: TaskEventMessage): void {
        this.logger.log(
            `[task.deleted] ${event.aggregateId} — before: ${JSON.stringify(event.payload.before)}, after: ${JSON.stringify(event.payload.after)}`,
        );
    }
}
