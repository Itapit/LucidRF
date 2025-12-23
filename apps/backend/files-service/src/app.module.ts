import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from './files/files.module';
import { GroupsIntegrationModule } from './integrations/groups/groups-integration.module';
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
        uri: ConfigService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    FilesModule,

    GroupsIntegrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
