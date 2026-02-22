import { Task } from 'src/tasks/domain/entity/task';

export interface TaskRepository {
    save(task: Task): Promise<Task>;
    findById(id: string): Promise<Task | null>;
    findAll(): Promise<Task[]>;
}
