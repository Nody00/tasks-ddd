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
    async createTask(@Body() body: CreateTaskDto) {
        const createdTask = await this.createTaskUseCase.execute(body);
        return TaskMapper.toResponseDto(createdTask);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiOkResponse({
        description: 'List of all tasks',
        type: [TaskResponseDto],
    })
    async getTasks() {
        const tasks = await this.getTasksUseCase.execute();
        return tasks.map((task) => TaskMapper.toResponseDto(task));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by ID' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({ description: 'The found task', type: TaskResponseDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    async getTaskById(@Param('id') id: string) {
        const task = await this.getTaskByIdUseCase.execute(id);
        return TaskMapper.toResponseDto(task);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update task status' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({ description: 'Task status updated successfully' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiBadRequestResponse({ description: 'Invalid status transition' })
    async updateTaskStatus(
        @Param('id') id: string,
        @Body() body: UpdateTaskStatusDto,
    ) {
        const updatedTask = await this.updateTaskStatusUseCase.execute(
            id,
            body.status,
        );
        return TaskMapper.toResponseDto(updatedTask);
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
    async updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
        const updatedTask = await this.updateTaskUseCase.execute(id, body);
        return TaskMapper.toResponseDto(updatedTask);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task' })
    @ApiParam({ name: 'id', description: 'Task ID' })
    @ApiOkResponse({
        description: 'Task deleted successfully',
        type: TaskResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Task not found' })
    async deleteTask(@Param('id') id: string) {
        const task = await this.deleteTaskUseCase.execute(id);
        return TaskMapper.toResponseDto(task);
    }
}
