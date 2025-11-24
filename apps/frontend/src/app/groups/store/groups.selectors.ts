import { createSelector } from '@ngrx/store';
import { groupsFeature } from './groups.reducer';

export const {
  selectLoading: selectGroupsLoading,
  selectError: selectGroupsError,
  selectLoaded: selectGroupsLoaded,
  selectGroups,
} = groupsFeature;

export const selectGroupById = (groupId: string) =>
  createSelector(selectGroups, (groups) => groups.find((group) => group.id === groupId) || null);
