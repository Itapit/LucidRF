import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { catchError, EMPTY, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { isPendingLoginResponse } from '@LucidRF/common';
import { Store } from '@ngrx/store';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { NavigationService } from '../../core/navigation/navigation.service';

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
  private navigationService = inject(NavigationService);
  private store = inject(Store<AuthState>);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * This effect runs exactly once when the NgRx store is initialized.
   */
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => AuthActions.refresh())
    )
  );

  // =================================================================
  // LOGIN & COMPLETE SETUP FLOWS
  // =================================================================
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.authService.login(request).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) => {
            return of(
              AuthActions.loginFailure({
                error: this.errorHandler.classifyActionError(error, AuthErrorSource.LOGIN),
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
            this.navigationService.toCompleteSetup();
            return;
          }
          // It's a LoginResponse
          this.tokenService.setToken(response.accessToken);
          this.navigationService.toHome();
        })
      ),
    { dispatch: false }
  );

  loadMeOnLoginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      switchMap(({ response }) => {
        if (isPendingLoginResponse(response)) {
          return EMPTY;
        }
        return of(AuthActions.loadMe());
      })
    )
  );

  completeSetup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.completeSetup),
      switchMap(({ request }) =>
        this.authService.completeSetup(request).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) => {
            return of(
              AuthActions.completeSetupFailure({
                error: this.errorHandler.classifyActionError(error, AuthErrorSource.COMPLETE_SETUP),
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
      ofType(AuthActions.refresh), // Triggered by Init OR interceptor
      switchMap(() =>
        this.authService.refresh().pipe(
          map((response) => AuthActions.refreshSuccess({ response })),
          catchError((error) => {
            return of(
              AuthActions.refreshFailure({
                error: this.errorHandler.classifyActionError(error, AuthErrorSource.REFRESH),
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
        return of(AuthActions.loadMe());
      })
    )
  );

  loadMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMe),
      switchMap(() =>
        this.authService.getMe().pipe(
          map((user) => AuthActions.loadMeSuccess({ user })),
          catchError((error) => {
            return of(
              AuthActions.loadMeFailure({
                error: this.errorHandler.classifyActionError(error, AuthErrorSource.LOAD_ME),
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
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess())) // Always logout locally
        )
      )
    )
  );

  logoutAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutAll),
      switchMap(() =>
        this.authService.logoutAll().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
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
          this.navigationService.toLogin();
        })
      ),
    { dispatch: false }
  );
}
