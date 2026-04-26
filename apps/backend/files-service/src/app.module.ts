import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from './files/files.module';
import { MlInferenceModule } from './integrations/ml-inference/ml-inference.module';
import { TeamsIntegrationModule } from './integrations/teams/teams-integration.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    StorageModule,

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (ConfigService: ConfigService) => ({
        uri: ConfigService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    EventEmitterModule.forRoot(),

    FilesModule,

    TeamsIntegrationModule,

    MlInferenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
