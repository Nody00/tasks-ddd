import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TaskStatus } from 'src/tasks/domain/entity/task';

export class UpdateTaskStatusDto {
    @ApiProperty({
        description: 'Status of the task',
        example: TaskStatus.OPEN,
        enum: TaskStatus,
    })
    @IsEnum(TaskStatus)
    status: TaskStatus;
}
