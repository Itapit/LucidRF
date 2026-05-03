export interface MlInferenceResult {
  average_probability: number;
  denoise_applied: boolean;
  total_attenuation_db?: number;
  papr_improvement_db?: number;
  flatness_reduction?: number;
  clean_storage_key?: string;
  spectrogram_key?: string;
}
