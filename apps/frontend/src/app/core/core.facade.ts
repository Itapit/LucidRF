import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CoreActions } from './core.actions';
import { coreFeature } from './core.reducer';

@Injectable({ providedIn: 'root' })
export class CoreFacade {
  private readonly store = inject(Store);

  /**
   * An observable that emits the global error message, or null.
   */
  globalError$ = this.store.select(coreFeature.selectGlobalError);

  clearGlobalError() {
    this.store.dispatch(CoreActions.clearGlobalError());
  }
}
