import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        description: 'Title of the task',
        example: 'Buy groceries',
        nullable: true,
        type: String,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the task',
        example: 'Milk, Bread, Eggs, and Butter',
        nullable: true,
        type: String,
    })
    @IsString()
    @IsOptional()
    description?: string;
}
