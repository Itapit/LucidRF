import { createFeature, createReducer, on } from '@ngrx/store';

import { isPendingLoginResponse, LoginResponse } from '@limbo/common';
import { AuthStatus } from '../dtos/auth-status.enum';
import { AuthActions } from './auth.actions';
import { AUTH_FEATURE_KEY, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // --- API Calls Start ---
  on(
    AuthActions.loginStart,
    AuthActions.completeSetupStart,
    AuthActions.refreshStart,
    AuthActions.loadMeStart,
    AuthActions.logoutStart,
    (state) => ({
      ...state,
      loading: true,
      error: null,
    })
  ),

  // --- API Calls Failure ---
  on(
    AuthActions.loginFailure,
    AuthActions.completeSetupFailure,
    AuthActions.refreshFailure,
    AuthActions.loadMeFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  ),

  // --- Specific Success Cases ---

  /**
   * This is now the main action for populating state after a login.
   * It handles both PENDING and ACTIVE users.
   */
  on(AuthActions.loginSuccess, (state, { response }) => {
    // Case 1: User is PENDING
    if (isPendingLoginResponse(response)) {
      return {
        ...state,
        loading: false,
        user: null,
        status: AuthStatus.PENDING,
      };
    }

    // Case 2: User is ACTIVE
    const loginResponse = response as LoginResponse;
    return {
      ...state,
      loading: false,
      error: null,
      user: loginResponse.user,
      status: AuthStatus.ACTIVE,
    };
  }),

  /**
   * This is only used by the App Init (F5 refresh) flow.
   */
  on(AuthActions.loadMeSuccess, (state, { user }) => ({
    ...state,
    loading: false,
    error: null,
    user: user,
    status: user.status as unknown as AuthStatus,
  })),

  /**
   * This action just stops the loading spinner.
   * The user data is loaded by the 'loadMeStart' effect it dispatches.
   */
  on(AuthActions.refreshSuccess, (state) => ({
    ...state,
    loading: false,
  })),

  /**
   * This resets the state completely.
   * The 'sessionEnd$' effect will handle redirecting.
   */
  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
    status: AuthStatus.LOGGED_OUT,
  })),

  /**
   * Clears any active error message.
   */
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);

export const authFeature = createFeature({
  name: AUTH_FEATURE_KEY,
  reducer: authReducer,
});
