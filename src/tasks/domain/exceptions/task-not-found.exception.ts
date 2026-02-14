export class TaskNotFoundException extends Error {
    constructor(id: string) {
        super(`Task with id ${id} not found`);
        this.name = 'TaskNotFoundException';
    }
}
