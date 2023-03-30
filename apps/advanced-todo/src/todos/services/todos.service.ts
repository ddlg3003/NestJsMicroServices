import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from '../shemas/todo.schema';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UpdateTodoDto } from '../dtos/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    private readonly rmqConnection: AmqpConnection,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = new this.todoModel(createTodoDto);
    const result = await todo.save();
    this.rmqConnection.publish<Todo>('todo-exchange', 'create', result);

    return result;
  }

  async update(id: string, createTodoDto: UpdateTodoDto): Promise<Todo> {
    let todo = await this.todoModel.findById(id);

    if(!todo) {
      throw new HttpException('Todo not found', HttpStatus.BAD_REQUEST);
    }

    todo = await this.todoModel.findByIdAndUpdate(id, createTodoDto, {
      new: true,
      runValidators: true,
    });

    this.rmqConnection.publish<Todo>('todo-exchange', 'update', todo);
    return todo;
  }
}
