import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { TaskRepository } from '../ports/task.repository';

export class DeleteTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(id: string): Promise<void> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new TaskNotFoundException(id);
        }

        return this.taskRepository.delete(id);
    }
}
