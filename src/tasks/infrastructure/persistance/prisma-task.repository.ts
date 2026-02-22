import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/database/prisma.service';
import { TaskRepository } from 'src/tasks/application/ports/task.repository';
import { Task } from 'src/tasks/domain/entity/task';
import { PrismaTaskMapper } from './prisma-task.mapper';
import { Prisma } from 'src/generated/prisma/browser';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(task: Task): Promise<Task> {
        const events = task.getDomainEvents();

        const saved = await this.prisma.$transaction(async (tx) => {
            const record = await tx.task.upsert({
                where: { id: task.id },
                update: {
                    title: task.title,
                    description: task.description,
                    status: task.status,
                },
                create: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                },
            });

            if (events.length > 0) {
                await tx.outboxEvent.createMany({
                    data: events.map((event) => ({
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        payload: event.payload as Prisma.InputJsonValue,
                    })),
                });
            }

            return record;
        });

        task.clearDomainEvents(); // AFTER successful commit — not before
        return PrismaTaskMapper.toDomain(saved);
    }

    async findById(id: string): Promise<Task | null> {
        const task = await this.prisma.task.findUnique({ where: { id } });
        return task ? PrismaTaskMapper.toDomain(task) : null;
    }

    async findAll(): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany();
        return tasks.map((task) => PrismaTaskMapper.toDomain(task));
    }

}
