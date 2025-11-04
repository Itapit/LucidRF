import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongoRefreshTokenRepository } from './repository/mongo-refresh-token.repository';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { RefreshTokenSchema, RefreshTokenSchemaFactory } from './repository/refresh-token.schema';

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
  providers: [AuthService, { provide: RefreshTokenRepository, useClass: MongoRefreshTokenRepository }],
  exports: [],
})
export class AuthModule {}
