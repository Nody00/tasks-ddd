import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from 'src/tasks/domain/entity/task';

export class TaskResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the task',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Title of the task',
        example: 'Buy groceries',
    })
    title: string;

    @ApiProperty({
        description: 'Description of the task',
        example: 'Milk, Bread, Eggs, and Butter',
    })
    description: string;

    @ApiProperty({
        description: 'Status of the task',
        example: TaskStatus.OPEN,
        enum: TaskStatus,
    })
    status: TaskStatus;
}
