import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { Router } from '@angular/router';
import { isPendingLoginResponse } from '@limbo/common';
import { Action, ActionCreator, Store } from '@ngrx/store';
import { AccessTokenService } from '../services/accessToken.service';
import { AuthService } from '../services/auth.service';
import { AuthActions } from './auth.actions';
import { selectUser } from './auth.selectors';
import { AuthState } from './auth.state';

// Define a type for the action creators that take an error string
type AuthFailureActionCreator = ActionCreator<string, (props: { error: string }) => { error: string } & Action>;

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private tokenService = inject(AccessTokenService);
  private router = inject(Router);
  private store = inject(Store<AuthState>);

  // Helper function to map HTTP errors to an Ngrx failure action.
  private handleApiError(error: HttpErrorResponse, action: AuthFailureActionCreator) {
    const errorMessage = error.error?.message || error.message || 'An unknown error occurred';
    return of(action({ error: errorMessage }));
  }

  // =================================================================
  // APP INIT FLOW (F5 REFRESH)
  // =================================================================
  appInit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.init),
      map(() => AuthActions.refreshStart())
    )
  );

  // =================================================================
  // LOGIN & COMPLETE SETUP FLOWS
  // =================================================================
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(({ request }) =>
        this.authService.login(request).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.loginFailure))
        )
      )
    )
  );

  completeSetup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.completeSetupStart),
      switchMap(({ request }) =>
        this.authService.completeSetup(request).pipe(
          map((response) => AuthActions.loginSuccess({ response })), // Dispatches LoginSuccess
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.completeSetupFailure))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          if (isPendingLoginResponse(response)) {
            this.tokenService.setToken(response.pendingToken);
            this.router.navigate(['/complete-setup']);
            return;
          }
          // It's a LoginResponse
          this.tokenService.setToken(response.accessToken);
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  // =================================================================
  // REFRESH & LOAD ME FLOWS
  // =================================================================
  refresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshStart), // Triggered by Init OR interceptor
      switchMap(() =>
        this.authService.refresh().pipe(
          map((response) => AuthActions.refreshSuccess({ response })),
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.refreshFailure))
        )
      )
    )
  );

  /**
   * This effect runs AFTER a successful refresh.
   * It checks the state to see if we need to load the user.
   */
  refreshSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshSuccess),
      tap(({ response }) => this.tokenService.setToken(response.accessToken)),
      withLatestFrom(this.store.select(selectUser)),
      switchMap(([, user]) => {
        // If user is already in state (interceptor refresh), do nothing.
        if (user) {
          return of();
        }
        // If user is null (F5 refresh), dispatch Load Me.
        return of(AuthActions.loadMeStart());
      })
    )
  );

  loadMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMeStart),
      switchMap(() =>
        this.authService.getMe().pipe(
          map((user) => AuthActions.loadMeSuccess({ user })),
          catchError((error: HttpErrorResponse) => this.handleApiError(error, AuthActions.loadMeFailure))
        )
      )
    )
  );

  // =================================================================
  // LOGOUT & FAILURE FLOWS
  // =================================================================
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutStart),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess())) // Always logout locally
        )
      )
    )
  );

  // This effect groups all "session end" events
  sessionEnd$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess, AuthActions.refreshFailure, AuthActions.loadMeFailure),
        tap(() => {
          this.tokenService.clear();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}
