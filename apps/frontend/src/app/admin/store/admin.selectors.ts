import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ADMIN_FEATURE_KEY, AdminState } from './admin.state';

export const selectAdminState = createFeatureSelector<AdminState>(ADMIN_FEATURE_KEY);

export const selectAllUsers = createSelector(selectAdminState, (state) => state.users);

export const selectAdminLoading = createSelector(selectAdminState, (state) => state.loading);

export const selectAdminLoaded = createSelector(selectAdminState, (state) => state.loaded);

export const selectAdminError = createSelector(selectAdminState, (state) => state.error);
