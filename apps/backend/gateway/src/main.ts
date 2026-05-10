/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { HttpGlobalExceptionFilter } from '@LucidRF/backend-common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('LucidRF API')
    .setDescription('The LucidRF API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  app.useGlobalFilters(new HttpGlobalExceptionFilter());

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
  // cookieParser is required to read HttpOnly cookies (refreshToken) from incoming requests.
  app.use(cookieParser());
  // Browsers send Origin as the page URL (e.g. Angular on :4200), not the API host (:3000).
  const corsOriginsEnv = process.env.CORS_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const corsOrigins =
    corsOriginsEnv && corsOriginsEnv.length > 0 ? corsOriginsEnv : ['http://localhost:4200', 'http://127.0.0.1:4200'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  await app.listen(port);
  Logger.log(`gateway is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`Swagger UI is available at: http://localhost:${port}/${globalPrefix}/docs`);
  Logger.log(`Swagger JSON is available at: http://localhost:${port}/${globalPrefix}/docs-json`);
}

bootstrap();
