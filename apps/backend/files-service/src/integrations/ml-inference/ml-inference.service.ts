import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { StorageService } from '../../storage/interfaces';
import { DenoiseJobResponse, DetectJobResponse, MlInferenceResult } from './interfaces';
import { ML_DENOISE_THRESHOLD_TOKEN, ML_INFERENCE_URL_TOKEN } from './ml-inference.constants';

@Injectable()
export class MlInferenceService {
  private readonly logger = new Logger(MlInferenceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly storageService: StorageService,
    @Inject(ML_INFERENCE_URL_TOKEN) private readonly mlUrl: string,
    @Inject(ML_DENOISE_THRESHOLD_TOKEN) private readonly threshold: number
  ) {}

  async processSdrFile(storageKey: string): Promise<MlInferenceResult> {
    this.logger.log(`Starting ML inference pipeline for file: ${storageKey}`);

    try {
      const getUrl = await this.storageService.getInternalPresignedGetUrl(storageKey);

      // Detection
      const averageProbability = await this.detectSignal(getUrl);
      this.logger.log(`Detection complete for ${storageKey}. Average probability: ${averageProbability}`);

      // Evaluation
      if (averageProbability < this.threshold) {
        this.logger.log(`Probability ${averageProbability} is below threshold ${this.threshold}. Skipping denoise.`);
        return {
          average_probability: averageProbability,
          denoise_applied: false,
        };
      }

      // Denoising
      this.logger.log(`Probability ${averageProbability} meets threshold ${this.threshold}. Starting denoise.`);

      const cleanStorageKey = `${storageKey}_clean.bin`;
      const spectrogramKey = `${storageKey}_spectrogram.png`;

      const cleanPutUrl = await this.storageService.getInternalPresignedPutUrl(cleanStorageKey);
      const spectrogramPutUrl = await this.storageService.getInternalPresignedPutUrl(spectrogramKey);

      const sinrGainDb = await this.denoiseSignal(getUrl, cleanPutUrl, spectrogramPutUrl);
      this.logger.log(`Denoise complete for ${storageKey}. SINR Gain: ${sinrGainDb}dB`);

      // Return MlInferenceResult
      return {
        average_probability: averageProbability,
        denoise_applied: true,
        sinr_gain_db: sinrGainDb,
        clean_storage_key: cleanStorageKey,
        spectrogram_key: spectrogramKey,
      };
    } catch (error) {
      this.logger.error(
        `ML inference pipeline failed for file ${storageKey}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw new InternalServerErrorException(`Failed to process ML inference for file ${storageKey}`);
    }
  }

  private async detectSignal(fileUrl: string): Promise<number> {
    this.logger.debug(`Calling detect endpoint`);
    const response = await firstValueFrom(
      this.httpService.post<DetectJobResponse>(`${this.mlUrl}/api/v1/jobs/detect`, {
        file_url: fileUrl,
      })
    );

    const probs = response.data.probabilities;
    return probs.length > 0 ? probs.reduce((sum, p) => sum + p, 0) / probs.length : 0;
  }

  private async denoiseSignal(inputUrl: string, outputUrl: string, spectrogramUrl: string): Promise<number> {
    this.logger.debug(`Calling denoise endpoint`);
    const response = await firstValueFrom(
      this.httpService.post<DenoiseJobResponse>(`${this.mlUrl}/api/v1/jobs/denoise`, {
        input_url: inputUrl,
        output_url: outputUrl,
        spectrogram_url: spectrogramUrl,
      })
    );

    return response.data.metrics.noise_reduction_db;
  }
}
