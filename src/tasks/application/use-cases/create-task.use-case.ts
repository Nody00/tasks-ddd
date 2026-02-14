import { Task } from 'src/tasks/domain/entity/task';
import { TaskRepository } from '../ports/task.repository';

export class CreateTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    execute(input: { title: string; description: string }): Task {
        const task = new Task(input.title, input.description);
        return this.taskRepository.save(task);
    }
}
