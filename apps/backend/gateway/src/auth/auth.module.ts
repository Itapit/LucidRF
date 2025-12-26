import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_PENDING_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  UserClientModule,
} from '@LucidRF/users-contracts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService, CookieService } from './services';
import { AccessJwtStrategy, PendingJwtStrategy, RefreshJwtStrategy } from './strategies';

@Module({
  imports: [
    UserClientModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessJwtStrategy,
    PendingJwtStrategy,
    RefreshJwtStrategy,
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
    CookieService,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
