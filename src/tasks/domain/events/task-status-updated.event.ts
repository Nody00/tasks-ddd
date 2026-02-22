import type { IDomainEvent } from 'src/shared/domain/events/domain-event.interface';
import type { TaskSnapshot } from './task-snapshot.type';

export class TaskStatusUpdatedEvent implements IDomainEvent {
    readonly eventType = 'task.status.updated';
    readonly aggregateType = 'Task';
    readonly occurredAt = new Date();

    constructor(
        public readonly aggregateId: string,
        public readonly payload: {
            before: TaskSnapshot; // the previous Task state before update
            after: TaskSnapshot; // the new Task state after update
        },
    ) {}
}
