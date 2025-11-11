import { inject, Injectable } from '@angular/core';
import { CompleteSetupRequest, LoginRequest } from '@limbo/common';
import { Store } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import {
  selectAuthError,
  selectAuthLoading,
  selectEmail,
  selectIsLoggedIn,
  selectIsLoggedOut,
  selectIsPending,
  selectLoginError,
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

  /** Emits the last known auth error */
  error$ = this.store.select(selectAuthError);
  loginError$ = this.store.select(selectLoginError);

  /** Emits the full UserDto object if logged in */
  user$ = this.store.select(selectUser);

  /** Emits the raw AuthStatus enum (e.g., ACTIVE, PENDING) */
  status$ = this.store.select(selectSessionStatus);

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
