import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule } from '../storage/storage.module';
import { ML_DENOISE_THRESHOLD_TOKEN, ML_INFERENCE_URL_TOKEN } from './ml-inference.constants';
import { MlInferenceService } from './ml-inference.service';

@Module({
  imports: [HttpModule, StorageModule, ConfigModule],
  providers: [
    MlInferenceService,
    {
      provide: ML_INFERENCE_URL_TOKEN,
      useFactory: (configService: ConfigService) =>
        configService.get<string>('ML_INFERENCE_URL') || 'http://ml-service:8000',
      inject: [ConfigService],
    },
    {
      provide: ML_DENOISE_THRESHOLD_TOKEN,
      useFactory: (configService: ConfigService) => {
        const threshold = configService.get<number>('ML_DENOISE_THRESHOLD');
        return threshold !== undefined ? threshold : 0.5;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MlInferenceService],
})
export class MlInferenceModule {}
