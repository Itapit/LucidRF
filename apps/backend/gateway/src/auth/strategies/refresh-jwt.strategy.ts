import { JWT_SECRET } from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN } from '../constants';
import { RefreshJwtPayload, RefreshUser } from '../types';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(@Inject(JWT_SECRET) jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.[REFRESH_TOKEN];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: RefreshJwtPayload): Promise<RefreshUser> {
    return {
      userId: payload.sub,
      jti: payload.jti,
    };
  }
}
