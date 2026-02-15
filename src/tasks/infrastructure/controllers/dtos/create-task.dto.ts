import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Buy groceries',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Description of the task',
        example: 'Milk, Bread, Eggs, and Butter',
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}
