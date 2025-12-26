import { JWT_SECRET } from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessJwtPayload, AccessUser } from '../types';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(JWT_SECRET) jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: jwtSecret,
    });
  }

  /**
   * This method runs *after* Passport validates the token's signature
   * and expiration. The 'payload' is the decoded object from the token.
   *
   * What we return here is what NestJS attaches to `request.user`.
   */
  async validate(payload: AccessJwtPayload): Promise<AccessUser> {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
