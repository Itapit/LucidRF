import { createFeature, createReducer, on } from '@ngrx/store';
import { CoreActions } from './core.actions';
import { CORE_FEATURE_KEY, initialCoreState } from './core.state';

export const coreReducer = createReducer(
  initialCoreState,
  on(CoreActions.setGlobalError, (state, { error }) => ({
    ...state,
    globalError: error,
  })),

  on(CoreActions.clearGlobalError, (state) => ({
    ...state,
    globalError: null,
  }))
);

export const coreFeature = createFeature({
  name: CORE_FEATURE_KEY,
  reducer: coreReducer,
});
