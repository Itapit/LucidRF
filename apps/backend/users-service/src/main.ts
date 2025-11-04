/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { USER_CONFIG } from '@limbo/users-contracts';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      // host: USER_CONFIG.HOST,
      port: USER_CONFIG.PORT,
    },
  });
  await app.listen();
  console.log(`Users Microservice is listening on port ${USER_CONFIG.PORT}`);
}

bootstrap();
