import { inject, Injectable } from '@angular/core';
import { AdminCreateUserRequest, CompleteSetupRequest, LoginRequest } from '@LucidRF/common';
import { Store } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import {
  selectAdminCreateUserError,
  selectAuthError,
  selectAuthLoading,
  selectCompleteSetupError,
  selectEmail,
  selectIsAppLoading,
  selectIsInitialized,
  selectIsLoggedIn,
  selectIsLoggedOut,
  selectIsPending,
  selectLoadMeError,
  selectLoginError,
  selectRefreshError,
  selectRole,
  selectSessionStatus,
  selectUser,
  selectUsername,
} from './auth.selectors';
import { AuthState } from './auth.state';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject<Store<{ auth: AuthState }>>(Store);

  // --- State Observables ---

  /** Emits true if any auth API call is in progress */
  loading$ = this.store.select(selectAuthLoading);

  /** Emits true if the app is in the initial loading state */
  isAppLoading$ = this.store.select(selectIsAppLoading);

  /** Emits the last known auth error */
  error$ = this.store.select(selectAuthError);

  /** Emits the last known login error */
  loginError$ = this.store.select(selectLoginError);

  /** Emits the last known admin create user error */
  adminCreateUserError$ = this.store.select(selectAdminCreateUserError);

  /** Emits the last known refresh error */
  refreshError$ = this.store.select(selectRefreshError);

  /** Emits the last known loadMe error */
  loadMeError$ = this.store.select(selectLoadMeError);

  /** Emits the last known completeSetup error */
  completeSetupError$ = this.store.select(selectCompleteSetupError);

  /** Emits the full UserDto object if logged in */
  user$ = this.store.select(selectUser);

  /** Emits the raw AuthStatus enum (e.g., ACTIVE, PENDING) */
  status$ = this.store.select(selectSessionStatus);

  /**
   * True once the initial "Refresh Token" check has finished (success or fail).
   */
  readonly isInitialized$ = this.store.select(selectIsInitialized);

  // --- Derived Observables ---

  /** Emits true if the user is authenticated and active */
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  /** Emits true if the user is definitively logged out */
  isLoggedOut$ = this.store.select(selectIsLoggedOut);

  /** Emits true if the user is in the PENDING state */
  isPending$ = this.store.select(selectIsPending);

  /** Emits the user's role (or null) */
  role$ = this.store.select(selectRole);

  /** Emits the user's username (or null) */
  username$ = this.store.select(selectUsername);

  /** Emits the user's email (or null) */
  email$ = this.store.select(selectEmail);

  // --- Action Dispatchers ---

  /**
   * Dispatches the login action.
   * @param request The user's email and password.
   */
  login(request: LoginRequest) {
    this.store.dispatch(AuthActions.loginStart({ request }));
  }

  /**Dispatches the admin create user action
   * @param request The new user's email password and role
   */
  adminCreateUser(request: AdminCreateUserRequest) {
    this.store.dispatch(AuthActions.adminCreateUserStart({ request }));
  }

  /**
   * Dispatches the complete-setup action for a PENDING user.
   * @param request The user's new password.
   */
  completeSetup(request: CompleteSetupRequest) {
    this.store.dispatch(AuthActions.completeSetupStart({ request }));
  }

  /**
   * Dispatches the refresh action (called by the interceptor).
   */
  refresh() {
    this.store.dispatch(AuthActions.refreshStart());
  }

  /**
   * Dispatches the logout action.
   */
  logout() {
    this.store.dispatch(AuthActions.logoutStart());
  }

  /**
   * Dispatches an action to clear any visible error messages.
   */
  clearError() {
    this.store.dispatch(AuthActions.clearError());
  }
}
