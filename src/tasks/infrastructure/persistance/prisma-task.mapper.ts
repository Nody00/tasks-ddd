import { Task as PrismaTask } from 'src/generated/prisma/client';
import { Task, TaskStatus } from 'src/tasks/domain/entity/task';

export class PrismaTaskMapper {
    static toDomain(prismaTask: PrismaTask): Task {
        return Task.reconstruct(
            prismaTask.id,
            prismaTask.title,
            prismaTask.description,
            prismaTask.status as TaskStatus,
        );
    }
}
