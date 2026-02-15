import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTaskUseCase } from 'src/tasks/application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from 'src/tasks/application/use-cases/delete-task.use-case';
import { GetTaskByIdUseCase } from 'src/tasks/application/use-cases/get-task-by-id.use-case';
import { GetTasksUseCase } from 'src/tasks/application/use-cases/get-tasks.use-case';
import { UpdateTaskStatusUseCase } from 'src/tasks/application/use-cases/update-task-status-use-case';
import { UpdateTaskUseCase } from 'src/tasks/application/use-cases/update-task.use-case';
import { TaskStatus } from 'src/tasks/domain/entity/task';

@Controller('tasks')
export class TaskController {
    constructor(
        private readonly createTaskUseCase: CreateTaskUseCase,
        private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
        private readonly getTasksUseCase: GetTasksUseCase,
        private readonly deleteTaskUseCase: DeleteTaskUseCase,
        private readonly updateTaskUseCase: UpdateTaskUseCase,
        private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    ) {}

    @Post()
    createTask(@Body() body: { title: string; description: string }) {
        return this.createTaskUseCase.execute(body);
    }

    @Get()
    getTasks() {
        return this.getTasksUseCase.execute();
    }

    @Get(':id')
    getTaskById(@Param('id') id: string) {
        return this.getTaskByIdUseCase.execute(id);
    }

    @Patch(':id/status')
    updateTaskStatus(
        @Param('id') id: string,
        @Body() body: { status: TaskStatus },
    ) {
        return this.updateTaskStatusUseCase.execute(id, body.status);
    }

    @Patch(':id')
    updateTask(
        @Param('id') id: string,
        @Body() body: { title?: string; description?: string },
    ) {
        return this.updateTaskUseCase.execute(id, body);
    }

    @Delete(':id')
    deleteTask(@Param('id') id: string) {
        return this.deleteTaskUseCase.execute(id);
    }
}
