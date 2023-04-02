import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'A string to description your incoming task',
    example: 'Go to mall, buy new book'
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Check if your task is completed or not, must be TRUE/FALSE',
  })
  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  updatedAt = Date.now();
}