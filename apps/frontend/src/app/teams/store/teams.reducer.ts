import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from '../../auth/store/auth.actions';
import { TeamsActions } from './teams.actions';
import { TEAMS_FEATURE_KEY, initialTeamsState } from './teams.state';

export const teamsReducer = createReducer(
  initialTeamsState,

  // --- GLOBAL ---
  on(AuthActions.logoutSuccess, () => initialTeamsState),

  // --- LOAD ---
  on(TeamsActions.loadTeams, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TeamsActions.loadTeamsSuccess, (state, { teams }) => ({
    ...state,
    teams,
    loaded: true,
    loading: false,
  })),
  on(TeamsActions.loadTeamsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- CREATE ---
  on(TeamsActions.createTeam, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TeamsActions.createTeamSuccess, (state, { team }) => ({
    ...state,
    teams: [...state.teams, team],
    loading: false,
  })),
  on(TeamsActions.createTeamFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- UPDATE ---
  on(TeamsActions.updateTeam, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TeamsActions.updateTeamSuccess, (state, { team }) => ({
    ...state,
    teams: state.teams.map((t) => (t.id === team.id ? team : t)),
    loading: false,
  })),
  on(TeamsActions.updateTeamFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- DELETE ---
  on(TeamsActions.deleteTeam, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TeamsActions.deleteTeamSuccess, (state, { teamId }) => ({
    ...state,
    teams: state.teams.filter((t) => t.id !== teamId),
    loading: false,
  })),
  on(TeamsActions.deleteTeamFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- MEMBERS (Optional: Update state on member changes if needed) ---
  on(TeamsActions.addMember, TeamsActions.removeMember, TeamsActions.updateMemberRole, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  // Success actions for members just update the team in the list

  on(
    TeamsActions.addMemberSuccess,
    TeamsActions.removeMemberSuccess,
    TeamsActions.updateMemberRoleSuccess,
    (state, { team }) => ({
      ...state,
      teams: state.teams.map((t) => (t.id === team.id ? team : t)),
      loading: false,
    })
  ),

  on(
    TeamsActions.addMemberFailure,
    TeamsActions.removeMemberFailure,
    TeamsActions.updateMemberRoleFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  )
);

export const teamsFeature = createFeature({
  name: TEAMS_FEATURE_KEY,
  reducer: teamsReducer,
});
