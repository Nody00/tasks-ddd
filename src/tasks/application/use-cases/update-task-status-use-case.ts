import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { TaskRepository } from '../ports/task.repository';
import { Task, TaskStatus } from 'src/tasks/domain/entity/task';

export class UpdateTaskStatusUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(taskId: string, newStatus: TaskStatus): Promise<Task> {
        const task = await this.taskRepository.findById(taskId);

        if (!task) {
            throw new TaskNotFoundException(taskId);
        }

        task.updateStatus(newStatus);

        return this.taskRepository.save(task);
    }
}
