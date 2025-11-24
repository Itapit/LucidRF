import { UserDto } from '@limbo/common';
import { AuthError } from '../dtos/auth-error';
import { SessionStatus } from '../dtos/session-status.enum';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  user: UserDto | null;
  sessionStatus: SessionStatus;
  loading: boolean;
  error: AuthError | null;
}

export const initialAuthState: AuthState = {
  user: null,
  sessionStatus: SessionStatus.UNKNOWN,
  loading: false,
  error: null,
};
