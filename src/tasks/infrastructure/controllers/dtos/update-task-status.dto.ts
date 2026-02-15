import { IsEnum } from 'class-validator';
import { TaskStatus } from 'src/tasks/domain/entity/task';

export class UpdateTaskStatusDto {
    @IsEnum(TaskStatus)
    status: TaskStatus;
}
