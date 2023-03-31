import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        exchanges: [],
        uri: config.get<string>('RABBITMQ_URI'),
        channels: {
          'todo-channel': {
            prefetchCount: 12,
            default: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get<string>('ELASTICSEARCH_USERNAME'),
          password: configService.get<string>('ELASTICSEARCH_PASSWORD'),
        }
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [WorkerService],
})
export class WorkerModule implements OnModuleInit {
  constructor(private readonly workerService: WorkerService){}
  public async onModuleInit() {
    await this.workerService.createIndex();
  }
}
