import {
  AdminCreateUserRequest,
  AuthRefreshResponse,
  CompleteSetupRequest,
  LoginRequest,
  LoginResponse,
  PendingLoginResponse,
  UserDto,
} from '@limbo/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthError } from '../dtos/auth-error';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login Start': props<{ request: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse | PendingLoginResponse }>(),
    'Login Failure': props<{ error: AuthError }>(),

    // Admin Create user
    'Admin Create User Start': props<{ request: AdminCreateUserRequest }>(),
    'Admin Create User Success': props<{ response: UserDto }>(),
    'Admin Create User Failure': props<{ error: AuthError }>(),

    // Complete Setup
    'Complete Setup Start': props<{ request: CompleteSetupRequest }>(), // uses login success
    'Complete Setup Failure': props<{ error: AuthError }>(),

    // Refresh flow
    'Refresh Start': emptyProps(), // triggered on 401 or bootstrap , sends RT
    'Refresh Success': props<{ response: AuthRefreshResponse }>(),
    'Refresh Failure': props<{ error: AuthError }>(),

    // Current user profile (/me)
    'Load Me Start': emptyProps(),
    'Load Me Success': props<{ user: UserDto }>(),
    'Load Me Failure': props<{ error: AuthError }>(),

    // Logout
    'Logout Start': emptyProps(),
    'Logout Success': emptyProps(),

    'Clear Error': emptyProps(),
  },
});
