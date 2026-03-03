import { inject, Injectable } from '@angular/core';
import {
  AddMemberRequest,
  CreateTeamRequest,
  RemoveMemberRequest,
  UpdateMemberRoleRequest,
  UpdateTeamRequest,
} from '@LucidRF/common';
import { Store } from '@ngrx/store';
import { TeamsActions } from './teams.actions';
import {
  selectTeamById,
  selectTeams,
  selectTeamsError,
  selectTeamsLoaded,
  selectTeamsLoading,
} from './teams.selectors';
import { TeamsState } from './teams.state';

@Injectable({ providedIn: 'root' })
export class TeamsFacade {
  private readonly store = inject<Store<{ teams: TeamsState }>>(Store);

  // --- State Observables ---

  /** Emits true if teams are being loaded */
  loading$ = this.store.select(selectTeamsLoading);

  /** Emits the last known teams error */
  error$ = this.store.select(selectTeamsError);

  /** Emits true if teams have been loaded */
  loaded$ = this.store.select(selectTeamsLoaded);

  /** Emits the full list of teams */
  teams$ = this.store.select(selectTeams);

  /** Emits a specific team by ID */
  selectTeamById(teamId: string) {
    return this.store.select(selectTeamById(teamId));
  }

  // --- Action Dispatchers ---

  /** Dispatches the loadTeams action */
  loadTeams() {
    this.store.dispatch(TeamsActions.loadTeams());
  }

  /** Dispatches the createTeam action */
  createTeam(teamData: CreateTeamRequest) {
    this.store.dispatch(TeamsActions.createTeam({ request: teamData }));
  }

  /** Dispatches the updateTeam action */
  updateTeam(teamId: string, changes: UpdateTeamRequest) {
    this.store.dispatch(TeamsActions.updateTeam({ teamId, request: changes }));
  }

  /** Dispatches the deleteTeam action */
  deleteTeam(teamId: string) {
    this.store.dispatch(TeamsActions.deleteTeam({ teamId }));
  }

  //** Dispatches the addMember action */
  addMember(teamId: string, request: AddMemberRequest) {
    this.store.dispatch(TeamsActions.addMember({ teamId, request }));
  }

  /** Dispatches the removeMember action */
  removeMember(teamId: string, request: RemoveMemberRequest) {
    this.store.dispatch(TeamsActions.removeMember({ teamId, request }));
  }

  /** Dispatches the updateMemberRole action */
  updateMemberRole(teamId: string, targetUserId: string, request: UpdateMemberRoleRequest) {
    this.store.dispatch(TeamsActions.updateMemberRole({ teamId, targetUserId, request }));
  }
}
