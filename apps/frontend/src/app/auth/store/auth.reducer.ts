import { createFeature, createReducer, on } from '@ngrx/store';

import { isPendingLoginResponse, LoginResponse } from '@limbo/common';
import { SessionStatus } from '../dtos/session-status.enum';
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
    AuthActions.adminCreateUserStart,
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
    AuthActions.adminCreateUserFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error: error,
    })
  ),

  on(AuthActions.refreshFailure, AuthActions.loadMeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
    sessionStatus: SessionStatus.LOGGED_OUT,
  })),

  // --- Specific Success Cases ---

  /**
   * This is the main action for populating state after a login.
   * It handles both PENDING and ACTIVE users.
   */
  on(AuthActions.loginSuccess, (state, { response }) => {
    // Case 1: User is PENDING
    if (isPendingLoginResponse(response)) {
      return {
        ...state,
        loading: false,
        user: null,
        sessionStatus: SessionStatus.PENDING,
      };
    }

    // Case 2: User is ACTIVE
    const loginResponse = response as LoginResponse;
    return {
      ...state,
      loading: false,
      error: null,
      user: loginResponse.user,
      sessionStatus: SessionStatus.ACTIVE,
    };
  }),

  on(AuthActions.adminCreateUserSuccess, (state) => ({
    ...state,
    loading: false,
  })),

  /**
   * This is only used by the App Init (F5 refresh) flow.
   */
  on(AuthActions.loadMeSuccess, (state, { user }) => ({
    ...state,
    loading: false,
    error: null,
    user: user,
    sessionStatus: user.status as unknown as SessionStatus,
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
    sessionStatus: SessionStatus.LOGGED_OUT,
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
