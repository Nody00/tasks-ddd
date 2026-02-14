import { TaskRepository } from '../ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';

export class GetTasksUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    execute(): Task[] {
        return this.taskRepository.findAll();
    }
}
