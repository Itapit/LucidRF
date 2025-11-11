import { RouterReducerState, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { AuthState } from '../auth/store/auth.state';
import { CoreState } from '../core/core.state';

export interface AppState {
  router: RouterReducerState<SerializedRouterStateSnapshot>;
  core: CoreState;
  auth: AuthState;
}

export const initialAppState: Partial<AppState> = {};
