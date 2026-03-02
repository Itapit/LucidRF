import { SystemRole } from '@LucidRF/common';
import { GeneratedTokensDto } from '../../application/dtos';

export abstract class TokenService {
  abstract generateAuthTokens(userId: string, role: SystemRole): Promise<GeneratedTokensDto>;
  abstract generatePendingToken(userId: string): Promise<string>;
}
