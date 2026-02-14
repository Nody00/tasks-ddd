import { Task } from 'src/tasks/domain/entity/task';

export interface TaskRepository {
    save(task: Task): Task;
    findById(id: string): Task | null;
    findAll(): Task[];
    delete(id: string): void;
}
