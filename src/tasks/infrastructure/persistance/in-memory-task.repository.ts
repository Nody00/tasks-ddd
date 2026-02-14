import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/tasks/application/ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';

@Injectable()
export class InMemoryTaskRepository implements TaskRepository {
    private tasks: Task[] = [];

    save(task: Task): Task {
        const existingIndex = this.tasks.findIndex((t) => t.id === task.id);

        if (existingIndex !== -1) {
            this.tasks[existingIndex] = task;
            return task;
        } else {
            this.tasks.push(task);
            return task;
        }
    }

    findById(id: string): Task | null {
        const foundTask = this.tasks.find((task) => task.id === id);

        if (!foundTask) {
            return null;
        }

        return foundTask;
    }

    findAll(): Task[] | [] {
        return this.tasks;
    }

    delete(id: string): void {
        this.tasks = this.tasks.filter((task) => task.id !== id);
    }
}
