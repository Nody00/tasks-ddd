import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { TaskRepository } from '../ports/task.repository';
import { TaskStatus } from 'src/tasks/domain/entity/task';

export class UpdateTaskStatusUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    execute(taskId: string, newStatus: TaskStatus): void {
        const task = this.taskRepository.findById(taskId);

        if (!task) {
            throw new TaskNotFoundException(taskId);
        }

        task.updateStatus(newStatus);
        this.taskRepository.save(task);
    }
}
