import { NestFactory } from '@nestjs/core';
import { WorkerUpdateModule } from './worker-update.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkerUpdateModule, {
    options: {
      port: 6000,
    },
  });
  await app.listen();
}
bootstrap();
