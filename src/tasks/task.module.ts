import { Module } from '@nestjs/common';

import { TaskController } from './infrastructure/controllers/task.controller';
import { InMemoryTaskRepository } from './infrastructure/persistance/in-memory-task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { GetTasksUseCase } from './application/use-cases/get-tasks.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { TaskRepository } from './application/ports/task.repository';

const TASK_REPOSITORY = 'TASK_REPOSITORY';

@Module({
    controllers: [TaskController],
    providers: [
        {
            provide: TASK_REPOSITORY,
            useClass: InMemoryTaskRepository,
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
    ],
})
export class TaskModule {}
