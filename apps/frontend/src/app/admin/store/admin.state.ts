import { UserDto } from '@LucidRF/common';
import { FeatureState } from '../../core/store/feature-state.interface';
import { AdminErrorSource } from '../dtos/admin-error-source.enum';

export const ADMIN_FEATURE_KEY = 'admin';

export interface AdminState extends FeatureState<AdminErrorSource> {
  users: UserDto[];
}

export const initialAdminState: AdminState = {
  users: [],
  loading: false,
  loaded: false,
  error: null,
};
