import { Request } from 'express';

// The raw payload inside the token
export interface RefreshJwtPayload {
  sub: string;
  jti: string;
}

// The clean user object attached to req.user
export interface RefreshUser {
  userId: string;
  jti: string;
}

// The request type
export interface RefreshAuthenticatedRequest extends Request {
  user: RefreshUser;
}
