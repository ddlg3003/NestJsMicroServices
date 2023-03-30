import { Body, Controller, Post, Put, Param } from '@nestjs/common';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { Todo } from '../shemas/todo.schema';
import { TodosService } from '../services/todos.service';
import { ValidateMongoIdPipe } from '../pipes/validate-mongo-id.pipe';

@Controller('todos')
export class TodosController {
  constructor(private readonly todoService: TodosService) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto);
  }

  @Put(':id')
  async update(
    @Param('id', ValidateMongoIdPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.update(id, updateTodoDto);
  }
}