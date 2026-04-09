import { ActionError } from './action-error.interface';

export interface FeatureState<TSource> {
  loading: boolean;
  loaded: boolean;
  error: ActionError<TSource> | null;
}
