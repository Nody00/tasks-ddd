import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/database/prisma.service';
import { TaskRepository } from 'src/tasks/application/ports/task.repository';
import { Task, TaskStatus } from 'src/tasks/domain/entity/task';
import { PrismaTaskMapper } from './prisma-task.mapper';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(task: Task): Promise<Task> {
        const saved = await this.prisma.task.upsert({
            where: { id: task.id },
            update: {
                title: task.title,
                description: task.description,
                status: task.status as TaskStatus,
            },
            create: {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status as TaskStatus,
            },
        });
        return PrismaTaskMapper.toDomain(saved);
    }

    async findById(id: string): Promise<Task | null> {
        const task = await this.prisma.task.findUnique({ where: { id } });
        return task ? PrismaTaskMapper.toDomain(task) : null;
    }

    async findAll(): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany();
        return tasks.map(PrismaTaskMapper.toDomain);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.task.delete({ where: { id } });
    }
}
