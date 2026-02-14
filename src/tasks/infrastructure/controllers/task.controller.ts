import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { CreateTaskUseCase } from 'src/tasks/application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from 'src/tasks/application/use-cases/delete-task.use-case';
import { GetTaskByIdUseCase } from 'src/tasks/application/use-cases/get-task-by-id.use-case';
import { GetTasksUseCase } from 'src/tasks/application/use-cases/get-tasks.use-case';
import { UpdateTaskUseCase } from 'src/tasks/application/use-cases/update-task.use-case';
import { TaskNotFoundException } from 'src/tasks/domain/exceptions/task-not-found.exception';

@Controller('tasks')
export class TaskController {
    constructor(
        private readonly createTaskUseCase: CreateTaskUseCase,
        private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
        private readonly getTasksUseCase: GetTasksUseCase,
        private readonly deleteTaskUseCase: DeleteTaskUseCase,
        private readonly updateTaskUseCase: UpdateTaskUseCase,
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
        try {
            return this.getTaskByIdUseCase.execute(id);
        } catch (error) {
            if (error instanceof TaskNotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }

    @Patch(':id')
    updateTask(
        @Param('id') id: string,
        @Body() body: { title?: string; description?: string },
    ) {
        try {
            return this.updateTaskUseCase.execute(id, body);
        } catch (error) {
            if (error instanceof TaskNotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }

    @Delete(':id')
    deleteTask(@Param('id') id: string) {
        try {
            return this.deleteTaskUseCase.execute(id);
        } catch (error) {
            if (error instanceof TaskNotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
}
