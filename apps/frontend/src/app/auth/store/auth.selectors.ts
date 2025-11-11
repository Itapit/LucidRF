import { createSelector } from '@ngrx/store';
import { AuthErrorSource } from '../dtos/auth-error-source.enum';
import { SessionStatus } from '../dtos/session-status.enum';
import { authFeature } from './auth.reducer';

export const {
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
  selectUser,
  selectSessionStatus: selectSessionStatus,
} = authFeature;

/**
 * Selects if the user is currently authenticated (has a user object and is ACTIVE).
 */
export const selectIsLoggedIn = createSelector(
  selectUser,
  selectSessionStatus,
  (user, status) => user !== null && status === SessionStatus.ACTIVE
);

/**
 * Selects if the user is definitively logged out.
 */
export const selectIsLoggedOut = createSelector(selectSessionStatus, (status) => status === SessionStatus.LOGGED_OUT);

/**
 * Selects if we are currently in the PENDING state.
 */
export const selectIsPending = createSelector(selectSessionStatus, (status) => status === SessionStatus.PENDING);

/**
 * Selects if we are still booting up (haven't checked token yet).
 */
export const selectIsUnknown = createSelector(selectSessionStatus, (status) => status === SessionStatus.UNKNOWN);

/**
 * Selects the user's role.
 */
export const selectRole = createSelector(selectUser, (user) => user?.role ?? null);

/**
 * Selects the user's username.
 */
export const selectUsername = createSelector(selectUser, (user) => user?.username ?? null);

/**
 * Selects the user's email.
 */
export const selectEmail = createSelector(selectUser, (user) => user?.email ?? null);

/**
 * Selects the error message *only if* it came from the 'login' flow.
 */
export const selectLoginError = createSelector(selectAuthError, (error) =>
  error?.source === AuthErrorSource.LOGIN ? error.message : null
);

/**
 * Selects the error message *only if* it came from the 'completeSetup' flow.
 */
export const selectCompleteSetupError = createSelector(selectAuthError, (error) =>
  error?.source === AuthErrorSource.COMPLETE_SETUP ? error.message : null
);

/**
 * Selects the error message *only if* it came from the 'register' flow.
 */
export const selectRegisterError = createSelector(selectAuthError, (error) =>
  error?.source === AuthErrorSource.REGISTER ? error.message : null
);

/**
 * Selects the error message *only if* it came from the 'load me' flow.
 */
export const selectLoadMeError = createSelector(selectAuthError, (error) =>
  error?.source === AuthErrorSource.LOAD_ME ? error.message : null
);

/**
 * Selects the error message *only if* it came from the 'refresh' flow.
 */
export const selectRefreshError = createSelector(selectAuthError, (error) =>
  error?.source === AuthErrorSource.REFRESH ? error.message : null
);
