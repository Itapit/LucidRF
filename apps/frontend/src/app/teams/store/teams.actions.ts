import {
  AddMemberRequest,
  CreateTeamRequest,
  RemoveMemberRequest,
  TeamDto,
  UpdateMemberRoleRequest,
  UpdateTeamRequest,
} from '@LucidRF/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ActionError } from '../../core/store/action-error.interface';
import { TeamsErrorSource } from '../dto/teams-error-source.enum';

export const TeamsActions = createActionGroup({
  source: 'Teams',
  events: {
    // --- LOAD ---
    'Load Teams': emptyProps(),
    'Load Teams Success': props<{ teams: TeamDto[] }>(),
    'Load Teams Failure': props<{ error: ActionError<TeamsErrorSource> }>(),
    'Load Team': props<{ teamId: string }>(),
    'Load Team Success': props<{ team: TeamDto }>(),
    'Load Team Failure': props<{ error: ActionError<TeamsErrorSource> }>(),

    // --- CREATE ---
    'Create Team': props<{ request: CreateTeamRequest }>(),
    'Create Team Success': props<{ team: TeamDto }>(),
    'Create Team Failure': props<{ error: ActionError<TeamsErrorSource> }>(),

    // --- UPDATE ---
    'Update Team': props<{ teamId: string; request: UpdateTeamRequest }>(),
    'Update Team Success': props<{ team: TeamDto }>(),
    'Update Team Failure': props<{ error: ActionError<TeamsErrorSource> }>(),

    // --- DELETE ---
    'Delete Team': props<{ teamId: string }>(),
    'Delete Team Success': props<{ teamId: string }>(),
    'Delete Team Failure': props<{ error: ActionError<TeamsErrorSource> }>(),

    // --- MEMBERS ---
    'Add Member': props<{ teamId: string; request: AddMemberRequest }>(),
    'Add Member Success': props<{ team: TeamDto }>(),
    'Add Member Failure': props<{ error: ActionError<TeamsErrorSource> }>(),

    'Remove Member': props<{ teamId: string; request: RemoveMemberRequest }>(),
    'Remove Member Success': props<{ team: TeamDto }>(),
    'Remove Member Failure': props<{ error: ActionError<TeamsErrorSource> }>(),

    'Update Member Role': props<{ teamId: string; targetUserId: string; request: UpdateMemberRoleRequest }>(),
    'Update Member Role Success': props<{ team: TeamDto }>(),
    'Update Member Role Failure': props<{ error: ActionError<TeamsErrorSource> }>(),
  },
});
