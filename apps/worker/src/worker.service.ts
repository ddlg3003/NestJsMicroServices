import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Todo } from './types/todo.interface';
import { SearchTodo } from './types/search-todo.interface';
import { HttpStatus } from '@nestjs/common/enums';
import { ROUTING_KEY, TODO_EXCHANGE } from './utils/globalVariables';

@Injectable()
export class WorkerService {
  constructor(
    private readonly elasticSearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async createIndex() {
    const index = this.configService.get<string>('INDEX');
    const getIndex = await this.elasticSearchService.indices.exists({
      index,
    });

    if (getIndex.statusCode === HttpStatus.NOT_FOUND) {
      this.elasticSearchService.indices.create(
        {
          index,
          body: {
            mappings: {
              properties: {
                id: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                isCompleted: {
                  type: 'boolean',
                },
                title: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
              },
            },
            settings: {
              analysis: {
                filter: {
                  autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 20,
                  },
                },
                analyzer: {
                  autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'autocomplete_filter'],
                  },
                },
              },
            },
          },
        },
        (err: Error) => {
          if (err) {
            console.log('Error occur: ', err);
          }
        },
      );
    }
  }

  @RabbitSubscribe({
    exchange: TODO_EXCHANGE,
    routingKey: ROUTING_KEY.CREATE,
    queueOptions: {
      exclusive: true,
    },
  })
  createTodoIndex(todo: Todo) {
    this.elasticSearchService.index<SearchTodo, Todo>({
      index: this.configService.get<string>('INDEX'),
      body: todo,
    }).catch(err => console.log('Something happen with indexing. Err: ', err));
  }
}
