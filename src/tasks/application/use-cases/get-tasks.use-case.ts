import { TaskRepository } from '../ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';

export class GetTasksUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(): Promise<Task[]> {
        return this.taskRepository.findAll();
    }
}
