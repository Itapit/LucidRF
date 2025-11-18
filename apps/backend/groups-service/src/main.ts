/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { GROUP_CONFIG } from '@limbo/groups-contracts';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      port: GROUP_CONFIG.PORT,
    },
  });

  await app.listen();
  console.log(`🚀 Application is running on: http://localhost:${GROUP_CONFIG}`);
}

bootstrap();
