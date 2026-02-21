import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/tasks/application/ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';

@Injectable()
export class InMemoryTaskRepository implements TaskRepository {
    private tasks: Task[] = [];

    async save(task: Task): Promise<Task> {
        const existingIndex = this.tasks.findIndex((t) => t.id === task.id);

        if (existingIndex !== -1) {
            this.tasks[existingIndex] = task;
            return task;
        } else {
            this.tasks.push(task);
            return Promise.resolve(task);
        }
    }

    async findById(id: string): Promise<Task | null> {
        const foundTask = this.tasks.find((task) => task.id === id);

        if (!foundTask) {
            return null;
        }

        return Promise.resolve(foundTask);
    }

    async findAll(): Promise<Task[]> {
        return Promise.resolve(this.tasks);
    }

    async delete(id: string): Promise<void> {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        return Promise.resolve();
    }
}
