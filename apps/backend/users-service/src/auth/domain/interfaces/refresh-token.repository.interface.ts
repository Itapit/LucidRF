import { RefreshTokenEntity } from '../entities';

export abstract class RefreshTokenRepository {
  /**
   * Creates a new refresh token entry in the database.
   */
  abstract create(userId: string, jti: string, expiresAt: Date, userAgent?: string): Promise<RefreshTokenEntity>;

  /**
   * Finds a token by its JTI (JWT ID).
   */
  abstract findByJti(jti: string): Promise<RefreshTokenEntity | null>;

  /**
   * Deletes a token by its JTI.
   */
  abstract delete(jti: string): Promise<void>;

  /**
   * Deletes all refresh tokens for a specific user (for "log out everywhere").
   */
  abstract deleteAllForUser(userId: string): Promise<void>;
}
