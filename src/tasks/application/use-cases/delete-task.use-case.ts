import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { TaskRepository } from '../ports/task.repository';

export class DeleteTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    execute(id: string): void {
        const task = this.taskRepository.findById(id);

        if (!task) {
            throw new TaskNotFoundException(id);
        }

        return this.taskRepository.delete(id);
    }
}
