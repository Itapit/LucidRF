export interface MlInferenceResult {
  average_probability: number;
  denoise_applied: boolean;
  sinr_gain_db?: number;
  clean_storage_key?: string;
  spectrogram_key?: string;
}
