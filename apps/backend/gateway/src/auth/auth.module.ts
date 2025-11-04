import { UserClientModule } from '@limbo/users-contracts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessJwtStrategy, PendingJwtStrategy, RefreshTokenStrategy } from './strategies';

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
  providers: [AuthService, AccessJwtStrategy, PendingJwtStrategy, RefreshTokenStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
