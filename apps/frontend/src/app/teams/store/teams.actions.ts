import {
  AddMemberRequest,
  CreateTeamRequest,
  TeamDto,
  RemoveMemberRequest,
  UpdateTeamRequest,
} from '@LucidRF/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TeamsError } from '../dto/teams-error';

export const TeamsActions = createActionGroup({
  source: 'Teams',
  events: {
    // --- LOAD ---
    'Load Teams': emptyProps(),
    'Load Teams Success': props<{ teams: TeamDto[] }>(),
    'Load Teams Failure': props<{ error: TeamsError }>(),

    // --- CREATE ---
    'Create Team': props<{ request: CreateTeamRequest }>(),
    'Create Team Success': props<{ team: TeamDto }>(),
    'Create Team Failure': props<{ error: TeamsError }>(),

    // --- UPDATE ---
    'Update Team': props<{ teamId: string; request: UpdateTeamRequest }>(),
    'Update Team Success': props<{ team: TeamDto }>(),
    'Update Team Failure': props<{ error: TeamsError }>(),

    // --- DELETE ---
    'Delete Team': props<{ teamId: string }>(),
    'Delete Team Success': props<{ teamId: string }>(),
    'Delete Team Failure': props<{ error: TeamsError }>(),

    // --- MEMBERS ---
    'Add Member': props<{ teamId: string; request: AddMemberRequest }>(),
    'Add Member Success': props<{ team: TeamDto }>(),
    'Add Member Failure': props<{ error: TeamsError }>(),

    'Remove Member': props<{ teamId: string; request: RemoveMemberRequest }>(),
    'Remove Member Success': props<{ team: TeamDto }>(),
    'Remove Member Failure': props<{ error: TeamsError }>(),
  },
});
