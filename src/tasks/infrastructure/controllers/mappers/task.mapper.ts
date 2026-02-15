import { Task } from 'src/tasks/domain/entity/task';
import { TaskResponseDto } from '../dtos/task-response.dto';

export class TaskMapper {
    static toResponseDto(task: Task): TaskResponseDto {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
        };
    }
}
