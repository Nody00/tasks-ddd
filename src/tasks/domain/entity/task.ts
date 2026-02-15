import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition-exception';

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

    constructor(title: string, description: string) {
        this.id = Math.random().toString(36).substring(2, 15);
        this.title = title;
        this.description = description;
        this.status = TaskStatus.OPEN;
    }

    updateStatus(status: TaskStatus) {
        if (!ALLOWED_TRANSITIONS[this.status].includes(status)) {
            throw new InvalidStatusTransitionException(this.status, status);
        }
        this.status = status;
    }

    updateTitle(title: string) {
        this.title = title;
    }

    updateDescription(description: string) {
        this.description = description;
    }
}
