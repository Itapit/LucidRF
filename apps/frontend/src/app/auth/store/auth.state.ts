import { UserDto } from '@LucidRF/common';
import { FeatureState } from '../../core/store/feature-state.interface';
import { AuthErrorSource } from '../dtos/auth-error-source.enum';
import { SessionStatus } from '../dtos/session-status.enum';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState extends FeatureState<AuthErrorSource> {
  user: UserDto | null;
  sessionStatus: SessionStatus;
}

export const initialAuthState: AuthState = {
  user: null,
  sessionStatus: SessionStatus.UNKNOWN,
  loading: false,
  loaded: false,
  error: null,
};
