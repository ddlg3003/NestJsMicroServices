import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkerModule, {
    options: {
      port: 6001,
    }
  });
  await app.listen();
}
bootstrap();
