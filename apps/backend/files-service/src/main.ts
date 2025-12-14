/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { FILES_CONFIG } from '@LucidRF/files-contracts';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      port: FILES_CONFIG.PORT,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Converts plain objects to DTO instances so validation runs
      whitelist: true, // Strips away properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are sent
    })
  );
  await app.listen();
  Logger.log(`🚀 Application is running on: http://localhost:${FILES_CONFIG.PORT}}`);
}

bootstrap();
