export interface SdrMetadata {
  average_probability: number;
  denoise_applied: boolean;
  sinr_gain_db?: number;
  spectrogram_key?: string;
  clean_storage_key?: string;
}

export type FileMetadata = Partial<SdrMetadata> & Record<string, unknown>;
