/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { TEAMS_CONFIG } from '@LucidRF/teams-contracts';
import { Logger } from '@nestjs/common';

import { RpcDomainExceptionFilter } from '@LucidRF/backend-common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      port: TEAMS_CONFIG.PORT,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Converts plain objects to DTO instances so validation runs
      whitelist: true, // Strips away properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are sent
    })
  );

  app.useGlobalFilters(new RpcDomainExceptionFilter());
  await app.listen();
  Logger.log(`Teams microservice is running on: http://localhost:${TEAMS_CONFIG.PORT}`);
}

bootstrap();
