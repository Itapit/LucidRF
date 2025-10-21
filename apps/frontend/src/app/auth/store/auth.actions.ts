import { AccessTokenInfo, LoginRequest, RegisterRequest, UserFull } from '@limbo/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  // the Refresh token (RT) will be stored as httpOnly same site cookie
  // the Access token (AT) will be store in memory
  source: 'Auth',
  events: {
    // login / register
    'Login Start': props<{ loginRequest: LoginRequest }>(),
    'Login Success': props<{ accessToken: AccessTokenInfo }>, // also receive new RT as cookie
    'Login Failure': props<{ error: string }>(),

    'Register Start': props<{ registerRequest: RegisterRequest }>(),
    'Register Success': props<{ accessToken: AccessTokenInfo }>, // also receive new RT as cookie
    'Register Failure': props<{ error: string }>(),

    // -------- Refresh flow --------
    'Refresh Start': emptyProps(), // triggered on 401 or app bootstrap, sends RT
    'Refresh Success': props<{ accessToken: AccessTokenInfo }>(), //also receive new RT
    'Refresh Failure': props<{ error: string }>(),

    // -------- Current user profile (/me) --------
    'Load Me Start': emptyProps(), // sends the access token as bearer
    'Load Me Success': props<{ user: UserFull }>(),
    'Load Me Failure': props<{ error: string }>(),

    // logout
    'Logout Start': emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: string }>(),

    'Clear Error': emptyProps(),
  },
});
