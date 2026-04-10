import {
  AuthRefreshResponse,
  CompleteSetupRequest,
  LoginRequest,
  LoginResponse,
  PendingLoginResponse,
  UserDto,
} from '@LucidRF/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ActionError } from '../../core/store/action-error.interface';
import { AuthErrorSource } from '../dtos/auth-error-source.enum';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login': props<{ request: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse | PendingLoginResponse }>(),
    'Login Failure': props<{ error: ActionError<AuthErrorSource> }>(),

    // Complete Setup
    'Complete Setup': props<{ request: CompleteSetupRequest }>(), // uses login success
    'Complete Setup Failure': props<{ error: ActionError<AuthErrorSource> }>(),

    // Refresh flow
    'Refresh': emptyProps(), // triggered on 401 or bootstrap , sends RT
    'Refresh Success': props<{ response: AuthRefreshResponse }>(),
    'Refresh Failure': props<{ error: ActionError<AuthErrorSource> }>(),

    // Current user profile (/me)
    'Load Me': emptyProps(),
    'Load Me Success': props<{ user: UserDto }>(),
    'Load Me Failure': props<{ error: ActionError<AuthErrorSource> }>(),

    // Logout
    'Logout': emptyProps(),
    'Logout Success': emptyProps(),

    /** Revoke refresh tokens everywhere (all devices / sessions). */
    'Logout All': emptyProps(),

    'Clear Error': emptyProps(),
  },
});
