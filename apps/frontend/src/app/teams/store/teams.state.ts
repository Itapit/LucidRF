import { TeamDto } from '@LucidRF/common';
import { TeamsError } from '../dto/teams-error';

export const TEAMS_FEATURE_KEY = 'teams';

export interface TeamsState {
  teams: TeamDto[];
  loaded: boolean;
  loading: boolean;
  error: TeamsError | null;
}

export const initialTeamsState: TeamsState = {
  teams: [],
  loaded: false,
  loading: false,
  error: null,
};
