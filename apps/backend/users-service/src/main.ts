/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { USER_CONFIG } from '@LucidRF/users-contracts';

import { RpcDomainExceptionFilter } from '@LucidRF/backend-common';
import { Logger, ValidationPipe } from '@nestjs/common';
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

  // transform: Automatically parses payloads to DTO instance types and primitives.
  // whitelist: Strips out any properties from the request that do not have decorators.
  // forbidNonWhitelisted: Throws a BadRequestException if extra properties are sent.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new RpcDomainExceptionFilter());
  await app.listen();
  Logger.log(`Users Microservice is listening on port ${USER_CONFIG.PORT}`);
}

bootstrap();
