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
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.status = TaskStatus.OPEN;
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
        return task;
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
