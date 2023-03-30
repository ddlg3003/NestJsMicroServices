import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateTodoDto {
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  isCompleted: boolean;

  updatedAt = Date.now();
}