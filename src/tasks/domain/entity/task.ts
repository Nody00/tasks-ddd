import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition-exception';
import type { IDomainEvent } from 'src/shared/domain/events/domain-event.interface';
import type { TaskSnapshot } from '../events/task-snapshot.type';
import { TaskCreatedEvent } from '../events/task-created.event';
import { TaskUpdatedEvent } from '../events/task-updated.event';
import { TaskDeletedEvent } from '../events/task-deleted.event';
import { TaskStatusUpdatedEvent } from '../events/task-status-updated.event';

export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    DELETED = 'DELETED',
}

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.OPEN]: [TaskStatus.IN_PROGRESS, TaskStatus.DELETED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE, TaskStatus.DELETED],
    [TaskStatus.DONE]: [TaskStatus.DELETED],
    [TaskStatus.DELETED]: [],
};

export class Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    private readonly domainEvents: IDomainEvent[] = [];

    constructor(title: string, description: string) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.status = TaskStatus.OPEN;
        this.raise(
            new TaskCreatedEvent(this.id, {
                before: null,
                after: this.snapshot(),
            }),
        );
    }

    static reconstruct(
        id: string,
        title: string,
        description: string,
        status: TaskStatus,
    ): Task {
        const task = new Task(title, description);
        task.id = id;
        task.status = status;
        task.clearDomainEvents(); // loaded from DB — discard the spurious TaskCreatedEvent
        return task;
    }

    protected raise(event: IDomainEvent): void {
        this.domainEvents.push(event);
    }

    getDomainEvents(): IDomainEvent[] {
        return [...this.domainEvents]; // defensive copy
    }

    clearDomainEvents(): void {
        this.domainEvents.length = 0;
    }

    // Produce a full point-in-time snapshot of this entity's state.
    // Called before and after each mutation to populate event payloads.
    private snapshot(): TaskSnapshot {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
        };
    }

    updateStatus(status: TaskStatus) {
        if (!ALLOWED_TRANSITIONS[this.status].includes(status)) {
            throw new InvalidStatusTransitionException(this.status, status);
        }
        const before = this.snapshot();
        this.status = status;
        const after = this.snapshot();

        this.raise(
            new TaskStatusUpdatedEvent(this.id, {
                before,
                after,
            }),
        );

        if (status === TaskStatus.DELETED) {
            this.raise(
                new TaskDeletedEvent(this.id, {
                    before,
                    after,
                }),
            );
        }
    }

    update(input: { title?: string; description?: string }): void {
        const titleChanged =
            input.title !== undefined && input.title !== this.title;
        const descChanged =
            input.description !== undefined &&
            input.description !== this.description;

        if (!titleChanged && !descChanged) return;

        const before = this.snapshot();
        if (titleChanged) this.title = input.title!;
        if (descChanged) this.description = input.description!;
        this.raise(
            new TaskUpdatedEvent(this.id, { before, after: this.snapshot() }),
        );
    }
}
