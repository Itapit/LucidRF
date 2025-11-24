import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessUser } from '../types/access-jwt.types';

interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * This method runs *after* Passport validates the token's signature
   * and expiration. The 'payload' is the decoded object from the token.
   *
   * What we return here is what NestJS attaches to `request.user`.
   */
  async validate(payload: JwtPayload): Promise<AccessUser> {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
