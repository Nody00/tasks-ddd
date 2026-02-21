import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { TaskRepository } from '../ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';

export class UpdateTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(
        id: string,
        input: { title?: string; description?: string },
    ): Promise<Task> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new TaskNotFoundException(id);
        }

        if (input.title) {
            task.updateTitle(input.title);
        }

        if (input.description) {
            task.updateDescription(input.description);
        }

        return this.taskRepository.save(task);
    }
}
