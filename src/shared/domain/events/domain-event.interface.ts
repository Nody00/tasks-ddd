export interface IDomainEvent {
    readonly eventType: string; // e.g. "task.created" — used for routing
    readonly aggregateId: string; // the entity's UUID — used as Kafka partition key
    readonly aggregateType: string; // e.g. "Task" — for multi-aggregate topics
    readonly occurredAt: Date; // domain time — when it happened, not when it was processed
    readonly payload: Record<string, unknown>; // event data — must be JSON-serializable
}
