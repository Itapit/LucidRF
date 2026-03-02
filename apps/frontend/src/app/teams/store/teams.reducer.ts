import { createFeature, createReducer, on } from '@ngrx/store';
import { TeamsActions } from './teams.actions';
import { TEAMS_FEATURE_KEY, initialTeamsState } from './teams.state';

export const teamsReducer = createReducer(
  initialTeamsState,

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
    teams: state.teams.map((g) => (g.id === team.id ? team : g)),
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
    teams: state.teams.filter((g) => g.id !== teamId),
    loading: false,
  })),
  on(TeamsActions.deleteTeamFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- MEMBERS (Optional: Update state on member changes if needed) ---
  on(TeamsActions.addMember, TeamsActions.removeMember, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  // Success actions for members just update the team in the list

  on(TeamsActions.addMemberSuccess, TeamsActions.removeMemberSuccess, (state, { team }) => ({
    ...state,
    teams: state.teams.map((g) => (g.id === team.id ? team : g)),
    loading: false,
  })),

  on(TeamsActions.addMemberFailure, TeamsActions.removeMemberFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const teamsFeature = createFeature({
  name: TEAMS_FEATURE_KEY,
  reducer: teamsReducer,
});
