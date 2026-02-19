import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { CreateTaskUseCase } from 'src/tasks/application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from 'src/tasks/application/use-cases/delete-task.use-case';
import { GetTaskByIdUseCase } from 'src/tasks/application/use-cases/get-task-by-id.use-case';
import { GetTasksUseCase } from 'src/tasks/application/use-cases/get-tasks.use-case';
import { UpdateTaskStatusUseCase } from 'src/tasks/application/use-cases/update-task-status-use-case';
import { UpdateTaskUseCase } from 'src/tasks/application/use-cases/update-task.use-case';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskMapper } from './mappers/task.mapper';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { TaskResponseDto } from './dtos/task-response.dto';
import { ThrottleWrite } from 'src/shared/infrastructure/decorators/throttle.decorators';

@ApiTags('tasks')
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

    @ThrottleWrite()
    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiCreatedResponse({
        description: 'Task successfully created',
        type: TaskResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    createTask(@Body() body: CreateTaskDto) {
        return this.createTaskUseCase.execute(body);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiOkResponse({
        description: 'List of all tasks',
        type: [TaskResponseDto],
    })
    getTasks() {
        return this.getTasksUseCase
            .execute()
            .map((task) => TaskMapper.toResponseDto(task));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by ID' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({ description: 'The found task', type: TaskResponseDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    getTaskById(@Param('id') id: string) {
        return TaskMapper.toResponseDto(this.getTaskByIdUseCase.execute(id));
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update task status' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({ description: 'Task status updated successfully' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiBadRequestResponse({ description: 'Invalid status transition' })
    updateTaskStatus(
        @Param('id') id: string,
        @Body() body: UpdateTaskStatusDto,
    ) {
        return this.updateTaskStatusUseCase.execute(id, body.status);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update task details' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({
        description: 'Task updated successfully',
        type: TaskResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
        return this.updateTaskUseCase.execute(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({ description: 'Task deleted successfully' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    deleteTask(@Param('id') id: string) {
        return this.deleteTaskUseCase.execute(id);
    }
}
