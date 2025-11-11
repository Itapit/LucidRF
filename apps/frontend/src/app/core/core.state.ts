export const CORE_FEATURE_KEY = 'core';

export interface CoreState {
  globalError: string | null;
}

export const initialCoreState: CoreState = {
  globalError: null,
};
