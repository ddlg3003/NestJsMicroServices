import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TodosController } from './controllers/todos.controller';
import { TodosService } from './services/todos.service';
import { Todo, TodoSchema } from './shemas/todo.schema';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        exchanges: [
          {
            name: 'todo-exchange',
            type: 'direct',
          },
        ],
        uri: config.get<string>('RABBITMQ_URI'),
        channels: {
          'todo-channel': {
            prefetchCount: 15,
            default: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }])
  ],
  controllers: [TodosController],
  providers: [TodosService]
})
export class TodosModule {}
