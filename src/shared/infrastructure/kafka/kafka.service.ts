import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import {
    Admin,
    Consumer,
    ITopicConfig,
    Kafka,
    KafkaMessage,
    Producer,
    ProducerRecord,
} from 'kafkajs';
import { KAFKA_TOPICS } from './kafka-topics.constants';

// All topics this application owns — declared here so the Admin client creates
// them with the correct configuration on startup regardless of broker defaults.
const MANAGED_TOPICS: ITopicConfig[] = [
    {
        topic: KAFKA_TOPICS.TASK_EVENTS,
        numPartitions: 3,
        replicationFactor: 1,
    },
];

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaService.name);
    private readonly kafka: Kafka;
    private producer: Producer;
    private readonly consumer: Consumer;
    private readonly admin: Admin;

    constructor() {
        const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(
            ',',
        );

        this.kafka = new Kafka({
            clientId: 'everything-api',
            brokers,
            retry: {
                initialRetryTime: 300,
                retries: 10,
            },
        });

        this.producer = this.kafka.producer({
            idempotent: true, // implies acks: -1 (all in-sync replicas) — strongest delivery guarantee
            retry: {
                retries: 5,
            },
        });

        this.consumer = this.kafka.consumer({
            groupId: 'everything-api-group',
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
        });

        this.admin = this.kafka.admin();
    }

    async onModuleInit(): Promise<void> {
        await this.connectWithRetry();
    }

    // KafkaJS's retry config covers produce/consume operations — not the initial connect() call.
    // Kafka typically takes 10-30s to be ready after the container starts, so we implement
    // our own retry loop here rather than failing hard on the first connection attempt.
    private async connectWithRetry(
        maxAttempts = 20,
        delayMs = 3000,
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.admin.connect();
                await this.ensureTopicsExist(MANAGED_TOPICS);
                await this.admin.disconnect();

                await this.producer.connect();
                this.logger.log('Kafka producer connected');

                await this.consumer.connect();
                this.logger.log('Kafka consumer connected');
                return;
            } catch (error) {
                const err = error as Error;
                if (attempt === maxAttempts) {
                    this.logger.error(
                        `Kafka connection failed after ${maxAttempts} attempts. Is the broker running?`,
                        err.message,
                    );
                    throw error;
                }
                this.logger.warn(
                    `Kafka not ready yet (attempt ${attempt}/${maxAttempts}) — retrying in ${delayMs / 1000}s...`,
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.producer.disconnect();
        await this.consumer.disconnect();
        this.logger.log('Kafka producer and consumer disconnected');
    }

    async produce(record: ProducerRecord): Promise<void> {
        await this.producer.send(record);
    }

    async subscribe(
        topics: string[],
        handler: (topic: string, message: KafkaMessage) => Promise<void> | void,
    ): Promise<void> {
        for (const topic of topics) {
            await this.consumer.subscribe({ topic, fromBeginning: false });
        }
        await this.consumer.run({
            autoCommit: true,
            autoCommitInterval: 5000,
            eachMessage: async ({ topic, message }) => {
                await handler(topic, message);
            },
        });
    }

    private async ensureTopicsExist(topics: ITopicConfig[]): Promise<void> {
        const existingTopics = await this.admin.listTopics();
        const topicsToCreate = topics.filter(
            (t) => !existingTopics.includes(t.topic),
        );
        if (topicsToCreate.length > 0) {
            await this.admin.createTopics({ topics: topicsToCreate });
            this.logger.log(
                `Created Kafka topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`,
            );
        }
    }
}
