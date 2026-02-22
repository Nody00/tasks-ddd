import type { IDomainEvent } from 'src/shared/domain/events/domain-event.interface';
import type { TaskSnapshot } from './task-snapshot.type';

export class TaskCreatedEvent implements IDomainEvent {
    readonly eventType = 'task.created';
    readonly aggregateType = 'Task';
    readonly occurredAt = new Date();

    constructor(
        public readonly aggregateId: string,
        public readonly payload: {
            before: null; // no previous state — this is a creation event
            after: TaskSnapshot; // the new Task state after creation
        },
    ) {}
}
