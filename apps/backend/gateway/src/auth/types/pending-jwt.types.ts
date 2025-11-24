import { UserStatus } from '@limbo/common';
import { Request } from 'express';

// The raw payload inside the token
export interface PendingJwtPayload {
  sub: string;
  status: UserStatus;
}

// The clean user object attached to req.user
export interface PendingUser {
  userId: string;
}

// The request type
export interface PendingAuthenticatedRequest extends Request {
  user: PendingUser;
}
