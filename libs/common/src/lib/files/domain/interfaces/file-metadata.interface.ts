export interface SdrMetadata {
  average_probability: number;
  denoise_applied: boolean;
  total_attenuation_db?: number;
  papr_improvement_db?: number;
  flatness_reduction?: number;
  clean_file_id?: string;
  spectrogram_file_id?: string;
}

export type FileMetadata = Partial<SdrMetadata> & Record<string, unknown>;
