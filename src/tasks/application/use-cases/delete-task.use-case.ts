import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { Task, TaskStatus } from 'src/tasks/domain/entity/task';
import { TaskRepository } from '../ports/task.repository';

export class DeleteTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(id: string): Promise<Task> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new TaskNotFoundException(id);
        }

        task.updateStatus(TaskStatus.DELETED);
        return this.taskRepository.save(task);
    }
}
