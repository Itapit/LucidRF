import { TeamType } from '@LucidRF/common';
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

export const selectPersonalTeam = createSelector(
  selectTeams,
  (teams) => teams.find((team) => team.type === TeamType.PERSONAL) || null
);

export const selectCollaborativeTeams = createSelector(selectTeams, (teams) =>
  teams.filter((team) => team.type === TeamType.COLLABORATIVE)
);
