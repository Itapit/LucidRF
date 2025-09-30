import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, of, switchMap } from 'rxjs';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      switchMap(() => of(AuthActions.loadAuthSuccess({ auth: [] }))),
      catchError((error) => {
        console.error('Error', error);
        return of(AuthActions.loadAuthFailure({ error }));
      })
    )
  );
}
