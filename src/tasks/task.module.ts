import { Module } from '@nestjs/common';

import { TaskController } from './infrastructure/controllers/task.controller';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { GetTasksUseCase } from './application/use-cases/get-tasks.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { TaskRepository } from './application/ports/task.repository';
import { UpdateTaskStatusUseCase } from './application/use-cases/update-task-status-use-case';
import { PrismaService } from 'src/shared/infrastructure/database/prisma.service';
import { PrismaTaskRepository } from './infrastructure/persistance/prisma-task.repository';
import { KafkaModule } from 'src/shared/infrastructure/kafka/kafka.module';
import { TaskEventsConsumerService } from './infrastructure/event-handlers/task-events.consumer';

const TASK_REPOSITORY = 'TASK_REPOSITORY';

@Module({
    imports: [KafkaModule],
    controllers: [TaskController],
    providers: [
        TaskEventsConsumerService,
        {
            provide: TASK_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new PrismaTaskRepository(prisma),
            inject: [PrismaService],
        },
        {
            provide: CreateTaskUseCase,
            useFactory: (repo: TaskRepository) => new CreateTaskUseCase(repo),
            inject: [TASK_REPOSITORY],
        },
        {
            provide: GetTaskByIdUseCase,
            useFactory: (repo: TaskRepository) => new GetTaskByIdUseCase(repo),
            inject: [TASK_REPOSITORY],
        },
        {
            provide: GetTasksUseCase,
            useFactory: (repo: TaskRepository) => new GetTasksUseCase(repo),
            inject: [TASK_REPOSITORY],
        },
        {
            provide: DeleteTaskUseCase,
            useFactory: (repo: TaskRepository) => new DeleteTaskUseCase(repo),
            inject: [TASK_REPOSITORY],
        },
        {
            provide: UpdateTaskUseCase,
            useFactory: (repo: TaskRepository) => new UpdateTaskUseCase(repo),
            inject: [TASK_REPOSITORY],
        },
        {
            provide: UpdateTaskStatusUseCase,
            useFactory: (repo: TaskRepository) =>
                new UpdateTaskStatusUseCase(repo),
            inject: [TASK_REPOSITORY],
        },
    ],
})
export class TaskModule {}
