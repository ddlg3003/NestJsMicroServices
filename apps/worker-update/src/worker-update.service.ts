import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Todo } from './types/todo.interface';
import { ROUTING_KEY, TODO_EXCHANGE } from 'apps/global/globalVariables';

@Injectable()
export class WorkerUpdateService {
  constructor(
    private readonly elasticSearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  @RabbitSubscribe({
    exchange: TODO_EXCHANGE,
    routingKey: ROUTING_KEY.UPDATE,
    queueOptions: {
      exclusive: true,
    },
  })
  updateTodoIndex(todo: Todo) {
    // ctx._source.title='sleep';
    const updateScript = Object
      .entries(todo)
      .reduce((script, [key, val]) => {
        if(key === 'isCompleted') {
          script += ` ctx._source.${key}=${val};`;
        } else {
          script += ` ctx._source.${key}='${val}';`;
        }
        return script;
      }, '');

    this.elasticSearchService.updateByQuery({
      index: this.configService.get<string>('INDEX'),
      body: {
        query: {
          match: {
            id: todo.id,
          },
        },
        script: {
          inline: updateScript,
        },
      },
    }).catch(err => console.log('Something happen with update index. Err: ', err));
  }
}
