import { createFeature, createReducer, on } from '@ngrx/store';
import { GroupsActions } from './groups.actions';
import { GROUPS_FEATURE_KEY, initialGroupsState } from './groups.state';

export const groupsReducer = createReducer(
  initialGroupsState,

  // --- LOAD ---
  on(GroupsActions.loadGroups, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GroupsActions.loadGroupsSuccess, (state, { groups }) => ({
    ...state,
    groups,
    loaded: true,
    loading: false,
  })),
  on(GroupsActions.loadGroupsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- CREATE ---
  on(GroupsActions.createGroup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GroupsActions.createGroupSuccess, (state, { group }) => ({
    ...state,
    groups: [...state.groups, group],
    loading: false,
  })),
  on(GroupsActions.createGroupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- UPDATE ---
  on(GroupsActions.updateGroup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GroupsActions.updateGroupSuccess, (state, { group }) => ({
    ...state,
    groups: state.groups.map((g) => (g.id === group.id ? group : g)),
    loading: false,
  })),
  on(GroupsActions.updateGroupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- DELETE ---
  on(GroupsActions.deleteGroup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GroupsActions.deleteGroupSuccess, (state, { groupId }) => ({
    ...state,
    groups: state.groups.filter((g) => g.id !== groupId),
    loading: false,
  })),
  on(GroupsActions.deleteGroupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- MEMBERS (Optional: Update state on member changes if needed) ---
  on(GroupsActions.addMember, GroupsActions.removeMember, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  // Success actions for members just update the group in the list

  on(GroupsActions.addMemberSuccess, GroupsActions.removeMemberSuccess, (state, { group }) => ({
    ...state,
    groups: state.groups.map((g) => (g.id === group.id ? group : g)),
    loading: false,
  })),

  on(GroupsActions.addMemberFailure, GroupsActions.removeMemberFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const groupsFeature = createFeature({
  name: GROUPS_FEATURE_KEY,
  reducer: groupsReducer,
});
