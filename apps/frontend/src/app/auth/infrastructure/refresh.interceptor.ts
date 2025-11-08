import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AccessTokenService } from '../services/accessToken.service';
import { AuthActions } from '../store/auth.actions';
import { AuthState } from '../store/auth.state';
import { isAuthFailureEndpoint } from './interceptor.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private tokenService = inject(AccessTokenService);
  private store = inject(Store<AuthState>);
  private actions$ = inject(Actions);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

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
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    error: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> {
    if (isAuthFailureEndpoint(req.url)) {
      // Final failure on an auth route.
      this.isRefreshing = false;
      this.store.dispatch(AuthActions.logoutStart());
      return throwError(() => error);
    }

    // This was a 401 on a normal API call. Handle refresh.
    return this.handleRefreshFlow(req, next);
  }

  private handleRefreshFlow(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
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
      // First 401
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

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

          // Refresh failed.
          this.refreshTokenSubject.next(null);
          // We don't need to dispatch logout, the 'sessionEnd$' effect
          // is already listening for 'refreshFailure'.
          const failureAction = action as ReturnType<typeof AuthActions.refreshFailure>;
          return throwError(() => new Error(failureAction.error));
        })
      );
    }
  }

  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
