import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AccessTokenService } from '../../services/access-token.service';
import { AuthActions } from '../../store/auth.actions';
import { AuthState } from '../../store/auth.state';
import { isAuthFinalFailureEndpoint, isAuthLoginEndpoint } from './interceptor.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private tokenService = inject(AccessTokenService);
  private store = inject(Store<AuthState>);
  private actions$ = inject(Actions);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  /**
   * Main intercept logic.
   */
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.tokenService.getToken();

    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next, error);
        }
        // Not a 401, just re-throw
        return throwError(() => error);
      })
    );
  }

  /**
   * This is a "router" for 401 errors, using our constants.
   */
  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    error: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> {
    if (isAuthLoginEndpoint(req.url)) {
      // This is a "failed login." Just let the error flow
      // back to the component's effect.
      return throwError(() => error);
    }

    if (isAuthFinalFailureEndpoint(req.url)) {
      // This is a "final failure" (e.g., bad refresh token).
      // We must log the user out.
      this.isRefreshing = false;
      this.store.dispatch(AuthActions.logoutStart());
      return throwError(() => error);
    }

    // This was a 401 on a normal API call (e.g., /api/users/me).
    // We must try to refresh the token.
    return this.handleRefreshFlow(req, next);
  }

  /**
   * This handles the complex refresh token rotation and "stampeding herd" logic.
   */
  private handleRefreshFlow(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      // Wait for the new token.
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((newToken) => {
          if (newToken) {
            return next.handle(this.addToken(req, newToken));
          }
          return throwError(() => new Error('Refresh token was null after refresh'));
        })
      );
    } else {
      // This is the first 401. Time to refresh.
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Mark as in-progress

      this.store.dispatch(AuthActions.refreshStart());

      return this.actions$.pipe(
        ofType(AuthActions.refreshSuccess, AuthActions.refreshFailure),
        take(1),
        switchMap((action) => {
          this.isRefreshing = false;

          if (action.type === AuthActions.refreshSuccess.type) {
            const newToken = this.tokenService.getToken();
            this.refreshTokenSubject.next(newToken);

            if (newToken) {
              return next.handle(this.addToken(req, newToken));
            }
            return throwError(() => new Error('New access token was null after refresh'));
          }

          this.refreshTokenSubject.next(null);

          const failureAction = action as ReturnType<typeof AuthActions.refreshFailure>;
          return throwError(() => failureAction.error);
        })
      );
    }
  }

  /**
   * Helper to add the token to a request
   */
  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
