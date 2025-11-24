import { inject, Injectable } from '@angular/core';
import { AddMemberRequest, CreateGroupRequest, RemoveMemberRequest, UpdateGroupRequest } from '@limbo/common';
import { Store } from '@ngrx/store';
import { GroupsActions } from './groups.actions';
import {
  selectGroupById,
  selectGroups,
  selectGroupsError,
  selectGroupsLoaded,
  selectGroupsLoading,
} from './groups.selectors';
import { GroupsState } from './groups.state';

Injectable({ providedIn: 'root' });
export class GroupsFacade {
  private readonly store = inject<Store<{ groups: GroupsState }>>(Store);

  // --- State Observables ---

  /** Emits true if groups are being loaded */
  loading$ = this.store.select(selectGroupsLoading);

  /** Emits the last known groups error */
  error$ = this.store.select(selectGroupsError);

  /** Emits true if groups have been loaded */
  loaded$ = this.store.select(selectGroupsLoaded);

  /** Emits the full list of groups */
  groups$ = this.store.select(selectGroups);

  /** Emits a specific group by ID */
  selectGroupById(groupId: string) {
    return this.store.select(selectGroupById(groupId));
  }

  // --- Action Dispatchers ---

  /** Dispatches the loadGroups action */
  loadGroups() {
    this.store.dispatch(GroupsActions.loadGroups());
  }

  /** Dispatches the createGroup action */
  createGroup(groupData: CreateGroupRequest) {
    this.store.dispatch(GroupsActions.createGroup({ request: groupData }));
  }

  /** Dispatches the updateGroup action */
  updateGroup(groupId: string, changes: UpdateGroupRequest) {
    this.store.dispatch(GroupsActions.updateGroup({ groupId, request: changes }));
  }

  /** Dispatches the deleteGroup action */
  deleteGroup(groupId: string) {
    this.store.dispatch(GroupsActions.deleteGroup({ groupId }));
  }

  //** Dispatches the addMember action */
  addMember(groupId: string, targetUserId: AddMemberRequest) {
    this.store.dispatch(GroupsActions.addMember({ groupId, request: targetUserId }));
  }

  /** Dispatches the removeMember action */
  removeMember(groupId: string, targetUserId: RemoveMemberRequest) {
    this.store.dispatch(GroupsActions.removeMember({ groupId, request: targetUserId }));
  }
}
