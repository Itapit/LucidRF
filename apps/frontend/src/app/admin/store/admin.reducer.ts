import { createFeature, createReducer, on } from '@ngrx/store';
import { AdminActions } from './admin.actions';
import { ADMIN_FEATURE_KEY, AdminState, initialAdminState } from './admin.state';

export const adminReducer = createReducer(
  initialAdminState,

  // Start Actions
  on(
    AdminActions.loadUsers,
    AdminActions.createUser,
    AdminActions.deleteUser,
    (state): AdminState => ({
      ...state,
      loading: true,
      error: null,
    })
  ),

  // Success Actions
  on(
    AdminActions.loadUsersSuccess,
    (state, { users }): AdminState => ({
      ...state,
      users,
      loading: false,
      loaded: true,
    })
  ),
  on(
    AdminActions.createUserSuccess,
    (state, { user }): AdminState => ({
      ...state,
      users: [...state.users, user],
      loading: false,
    })
  ),
  on(
    AdminActions.deleteUserSuccess,
    (state, { id }): AdminState => ({
      ...state,
      users: state.users.filter((u) => u.id !== id),
      loading: false,
    })
  ),

  // Failure Actions
  on(
    AdminActions.loadUsersFailure,
    AdminActions.createUserFailure,
    AdminActions.deleteUserFailure,
    (state, { error }): AdminState => ({
      ...state,
      error,
      loading: false,
    })
  )
);

export const adminFeature = createFeature({
  name: ADMIN_FEATURE_KEY,
  reducer: adminReducer,
});
