export interface SdrMetadata {
  average_probability: number;
  denoise_applied: boolean;
  sinr_gain_db?: number;
  clean_file_id?: string;
  spectrogram_file_id?: string;
}

export type FileMetadata = Partial<SdrMetadata> & Record<string, unknown>;
