import { AddMemberRequest, CreateGroupRequest, GroupDto, RemoveMemberRequest, UpdateGroupRequest } from '@limbo/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GroupsError } from '../dto/groups-error';

export const GroupsActions = createActionGroup({
  source: 'Groups',
  events: {
    // --- LOAD ---
    'Load Groups': emptyProps(),
    'Load Groups Success': props<{ groups: GroupDto[] }>(),
    'Load Groups Failure': props<{ error: GroupsError }>(),

    // --- CREATE ---
    'Create Group': props<{ request: CreateGroupRequest }>(),
    'Create Group Success': props<{ group: GroupDto }>(),
    'Create Group Failure': props<{ error: GroupsError }>(),

    // --- UPDATE ---
    'Update Group': props<{ groupId: string; request: UpdateGroupRequest }>(),
    'Update Group Success': props<{ group: GroupDto }>(),
    'Update Group Failure': props<{ error: GroupsError }>(),

    // --- DELETE ---
    'Delete Group': props<{ groupId: string }>(),
    'Delete Group Success': props<{ groupId: string }>(),
    'Delete Group Failure': props<{ error: GroupsError }>(),

    // --- MEMBERS ---
    'Add Member': props<{ groupId: string; request: AddMemberRequest }>(),
    'Add Member Success': props<{ group: GroupDto }>(),
    'Add Member Failure': props<{ error: GroupsError }>(),

    'Remove Member': props<{ groupId: string; request: RemoveMemberRequest }>(),
    'Remove Member Success': props<{ group: GroupDto }>(),
    'Remove Member Failure': props<{ error: GroupsError }>(),
  },
});
