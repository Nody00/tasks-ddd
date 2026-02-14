import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';
import { TaskRepository } from '../ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';

export class GetTaskByIdUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    execute(id: string): Task {
        const task = this.taskRepository.findById(id);

        if (!task) {
            throw new TaskNotFoundException(id);
        }

        return task;
    }
}
