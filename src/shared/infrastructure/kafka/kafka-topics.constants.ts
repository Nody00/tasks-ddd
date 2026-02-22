// Single source of truth for all Kafka topic names used by this application.
// Both the producer (OutboxRelayService) and consumers reference this file
// so topic names can never drift out of sync between the two sides.
export const KAFKA_TOPICS = {
    TASK_EVENTS: 'task-events',
} as const;

// Mapping from aggregateType → topic. OutboxRelayService uses this to route
// events from any aggregate to the correct topic without hardcoding topic names
// inside the relay itself.
export const AGGREGATE_TYPE_TO_TOPIC: Record<string, string> = {
    Task: KAFKA_TOPICS.TASK_EVENTS,
};
