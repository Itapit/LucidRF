import { GroupDto } from '@limbo/common';
import { GroupsError } from '../dto/groups-error';

export const GROUPS_FEATURE_KEY = 'groups';

export interface GroupsState {
  groups: GroupDto[];
  loaded: boolean;
  loading: boolean;
  error: GroupsError | null;
}

export const initialGroupsState: GroupsState = {
  groups: [],
  loaded: false,
  loading: false,
  error: null,
};
