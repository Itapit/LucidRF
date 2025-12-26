import { UserRole } from '@LucidRF/common';
import { GeneratedTokensDto } from '../../application/dtos';

export abstract class TokenService {
  abstract generateAuthTokens(userId: string, role: UserRole): Promise<GeneratedTokensDto>;
  abstract generatePendingToken(userId: string): Promise<string>;
}
