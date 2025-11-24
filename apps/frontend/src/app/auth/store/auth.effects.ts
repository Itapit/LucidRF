import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { catchError, EMPTY, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { Router } from '@angular/router';
import { isPendingLoginResponse } from '@limbo/common';
import { Store } from '@ngrx/store';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { AuthError } from '../dtos/auth-error';
import { AuthErrorSource } from '../dtos/auth-error-source.enum';
import { AccessTokenService } from '../services/access-token.service';
import { AuthService } from '../services/auth.service';
import { AuthActions } from './auth.actions';
import { selectUser } from './auth.selectors';
import { AuthState } from './auth.state';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private tokenService = inject(AccessTokenService);
  private router = inject(Router);
  private store = inject(Store<AuthState>);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * This effect runs exactly once when the NgRx store is initialized.
   */
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
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
          catchError((error) => {
            return of(
              AuthActions.loginFailure({
                error: this.createError(error, AuthErrorSource.LOGIN),
              })
            );
          })
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
            this.router.navigate(['auth/complete-setup']);
            return;
          }
          // It's a LoginResponse
          this.tokenService.setToken(response.accessToken);
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  completeSetup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.completeSetupStart),
      switchMap(({ request }) =>
        this.authService.completeSetup(request).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) => {
            return of(
              AuthActions.completeSetupFailure({
                error: this.createError(error, AuthErrorSource.COMPLETE_SETUP),
              })
            );
          })
        )
      )
    )
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
          catchError((error) => {
            return of(
              AuthActions.refreshFailure({
                error: this.createError(error, AuthErrorSource.REFRESH),
              })
            );
          })
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
          return EMPTY;
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
          catchError((error) => {
            return of(
              AuthActions.loadMeFailure({
                error: this.createError(error, AuthErrorSource.LOAD_ME),
              })
            );
          })
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

  // =================================================================
  // ADMIN CREATE USER FLOWS
  // =================================================================
  adminCreateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.adminCreateUserStart),
      switchMap(({ request }) =>
        this.authService.adminCreateUser(request).pipe(
          map((response) => AuthActions.adminCreateUserSuccess({ response })),
          catchError((error) => {
            return of(
              AuthActions.adminCreateUserFailure({
                error: this.createError(error, AuthErrorSource.ADMIN_CREATE_USER),
              })
            );
          })
        )
      )
    )
  );

  /**
   * Helper to construct the AuthError object using the ErrorHandlerService.
   */
  private createError(error: unknown, source: AuthErrorSource): AuthError {
    return {
      message: this.errorHandler.classifyError(error),
      source,
    };
  }
}
