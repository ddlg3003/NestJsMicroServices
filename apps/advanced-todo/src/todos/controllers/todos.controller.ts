import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  Query,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { Todo } from '../shemas/todo.schema';
import { TodosService } from '../services/todos.service';
import { ValidateMongoIdPipe } from '../pipes/validate-mongo-id.pipe';
import { TodoDoc } from '../../types/todo.interface';

@Controller('todos')
export class TodosController {
  constructor(
    private readonly todoService: TodosService,
  ) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string): Promise<TodoDoc[]> {
    const data = await this.todoService.search(keyword.toLowerCase());

    if (!data.length) {
      throw new HttpException('No todos found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  @Put(':id')
  async update(
    @Param('id', ValidateMongoIdPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.todoService.update(id, updateTodoDto);

    if (!todo) {
      throw new HttpException('Todo not exist', HttpStatus.BAD_REQUEST);
    }

    return todo;
  }
}
