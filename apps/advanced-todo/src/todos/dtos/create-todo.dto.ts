import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'A string to description your incoming task',
    example: 'Go to mall, buy new book'
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  constructor(title: string, createdAt: Date) {
    this.title = title;
    this.createdAt = createdAt;
  }
}