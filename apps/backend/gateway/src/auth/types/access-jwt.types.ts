import { Request } from 'express';

// The raw payload inside the token
export interface AccessJwtPayload {
  sub: string;
  role: string;
}

// The clean user object attached to req.user
export interface AccessUser {
  userId: string;
  role: string;
}

// The request type
export interface AccessAuthenticatedRequest extends Request {
  user: AccessUser;
}
