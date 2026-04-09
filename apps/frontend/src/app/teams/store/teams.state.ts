import { TeamDto } from '@LucidRF/common';
import { FeatureState } from '../../core/store/feature-state.interface';
import { TeamsErrorSource } from '../dto/teams-error-source.enum';

export const TEAMS_FEATURE_KEY = 'teams';

export interface TeamsState extends FeatureState<TeamsErrorSource> {
  teams: TeamDto[];
}

export const initialTeamsState: TeamsState = {
  teams: [],
  loading: false,
  loaded: false,
  error: null,
};
