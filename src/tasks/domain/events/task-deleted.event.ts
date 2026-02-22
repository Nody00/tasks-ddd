import type { IDomainEvent } from 'src/shared/domain/events/domain-event.interface';
import type { TaskSnapshot } from './task-snapshot.type';

export class TaskDeletedEvent implements IDomainEvent {
    readonly eventType = 'task.deleted';
    readonly aggregateType = 'Task';
    readonly occurredAt = new Date();

    constructor(
        public readonly aggregateId: string,
        public readonly payload: {
            before: TaskSnapshot; // the previous Task state before deletion
            after: TaskSnapshot; // no new state — this is a deletion event
        },
    ) {}
}
