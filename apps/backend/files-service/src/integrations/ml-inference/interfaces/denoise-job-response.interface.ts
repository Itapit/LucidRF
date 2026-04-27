export interface DenoiseJobResponse {
  status: string;
  metrics: {
    total_attenuation_db: number;
    papr_improvement_db: number;
    flatness_reduction: number;
  };
}
