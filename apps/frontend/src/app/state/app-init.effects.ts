import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { map } from 'rxjs';
import { AuthActions } from '../auth/store/auth.actions';

@Injectable()
export class AppInitEffects {
  private actions$ = inject(Actions);

  /**
   * This effect runs exactly once when the NgRx store is initialized.
   */
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => AuthActions.init())
    )
  );
}
