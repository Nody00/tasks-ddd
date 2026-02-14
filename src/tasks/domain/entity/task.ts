export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    DELETED = 'DELETED',
}

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
        this.status = status;
    }

    updateTitle(title: string) {
        this.title = title;
    }

    updateDescription(description: string) {
        this.description = description;
    }
}
