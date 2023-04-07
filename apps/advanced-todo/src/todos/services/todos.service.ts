import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from '../shemas/todo.schema';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { ElasticBody } from '../types/elastic-body.interface';
import { TodoDoc } from '../types/todo-doc';
import { ROUTING_KEY, TODO_EXCHANGE } from 'apps/advanced-todo/src/utils/globalVariables';
import { LIMIT } from '../../utils/globalVariables';
import { CreateTodoDto } from '../dtos/create-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    private readonly rmqConnection: AmqpConnection,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = new this.todoModel(createTodoDto);
    const result = await todo.save();
    this.rmqConnection.publish<Todo>(TODO_EXCHANGE, ROUTING_KEY.CREATE, result);

    return result;
  }

  async search(keyword: string, page: number = 1) {
    try {
      let data: TodoDoc[];
      const existedVal: string = await this.cacheManager.get(`${keyword}_${page}`);

      if (existedVal) {
        data = JSON.parse(existedVal);
        console.log('[Redis] Get data from cache');
      } else {
        const {
          body: {
            hits: { hits },
          },
        }: { body: ElasticBody } = await this.elasticSearchService.search({
          index: this.configService.get<string>('INDEX'),
          body: {
            from: (page - 1) * LIMIT,
            size: LIMIT,
            query: {
              match: {
                title: keyword,
              },
            },
          },
        });

        data = hits.map((item) => item._source);
        this.cacheManager.set(`${keyword}_${page}`, JSON.stringify(data), 900);
      }

      return data;
    } catch (e) {
      throw new HttpException('No items to find', HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todoModel.findByIdAndUpdate(id, updateTodoDto, {
      new: true,
      runValidators: true,
    });

    if (todo) {
      this.rmqConnection.publish<Todo>(TODO_EXCHANGE, ROUTING_KEY.UPDATE, todo);
      this.cacheManager.reset();
    }

    return todo;
  }
}
