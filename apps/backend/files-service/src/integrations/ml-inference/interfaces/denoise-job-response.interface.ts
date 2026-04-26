export interface DenoiseJobResponse {
  status: string;
  metrics: {
    noise_reduction_db: number;
  };
}
