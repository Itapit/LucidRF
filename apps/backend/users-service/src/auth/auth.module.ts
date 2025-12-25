import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_PENDING_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from '@LucidRF/users-contracts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/users.module';
import { AuthService } from './application/auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenRepository } from './domain/interfaces/refresh-token.repository.interface';
import { TokenSecurityService } from './domain/services/security.service';
import { MongoRefreshTokenRepository } from './infrastructure/repositories/mongo-refresh-token.repository';
import { RefreshTokenSchema, RefreshTokenSchemaFactory } from './infrastructure/schemas/refresh-token.schema';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: RefreshTokenSchema.name, schema: RefreshTokenSchemaFactory }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenSecurityService,
    { provide: RefreshTokenRepository, useClass: MongoRefreshTokenRepository },
    {
      provide: JWT_ACCESS_EXPIRES_IN,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');
      },
      inject: [ConfigService],
    },
    {
      provide: JWT_REFRESH_EXPIRES_IN,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
      },
      inject: [ConfigService],
    },
    {
      provide: JWT_PENDING_EXPIRES_IN,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<string>('JWT_PENDING_EXPIRES_IN');
      },
      inject: [ConfigService],
    },
    {
      provide: JWT_SECRET,
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<string>('JWT_SECRET');
      },
      inject: [ConfigService],
    },
  ],
  exports: [],
})
export class AuthModule {}
