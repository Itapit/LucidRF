import { createSelector } from '@ngrx/store';
import { teamsFeature } from './teams.reducer';

export const {
  selectLoading: selectTeamsLoading,
  selectError: selectTeamsError,
  selectLoaded: selectTeamsLoaded,
  selectTeams,
} = teamsFeature;

export const selectTeamById = (teamId: string) =>
  createSelector(selectTeams, (teams) => teams.find((team) => team.id === teamId) || null);
