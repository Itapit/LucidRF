import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of, switchMap } from 'rxjs';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { GroupsService } from '../services/groups.service';
import { GroupsActions } from './groups.actions';

import { Action } from '@ngrx/store';
import { GroupsError } from '../dto/groups-error';
import { GroupsErrorSource } from '../dto/groups-error-source.enum';

@Injectable()
export class GroupsEffects {
  private actions$ = inject(Actions);
  private groupsService = inject(GroupsService);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * TRIGGER: Automatically dispatch this action when the effect is initialized.
   * This ensures groups load as soon as this module is lazy-loaded after login.
   */
  ngrxOnInitEffects(): Action {
    return GroupsActions.loadGroups();
  }

  // --- LOAD ---
  loadGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.loadGroups),
      switchMap(() =>
        this.groupsService.loadGroups().pipe(
          map((groups) => GroupsActions.loadGroupsSuccess({ groups })),
          catchError((error) => {
            return of(
              GroupsActions.loadGroupsFailure({
                error: this.createError(error, GroupsErrorSource.LOAD),
              })
            );
          })
        )
      )
    )
  );

  // --- CREATE ---
  createGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.createGroup),
      concatMap(({ request }) =>
        this.groupsService.createGroup(request).pipe(
          map((group) => {
            return GroupsActions.createGroupSuccess({ group });
          }),
          catchError((error) =>
            of(
              GroupsActions.createGroupFailure({
                error: this.createError(error, GroupsErrorSource.CREATE),
              })
            )
          )
        )
      )
    )
  );

  // --- UPDATE ---
  updateGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.updateGroup),
      concatMap(({ groupId, request }) =>
        this.groupsService.updateGroup(groupId, request).pipe(
          map((group) => GroupsActions.updateGroupSuccess({ group })),
          catchError((error) =>
            of(
              GroupsActions.updateGroupFailure({
                error: this.createError(error, GroupsErrorSource.UPDATE),
              })
            )
          )
        )
      )
    )
  );

  // --- DELETE ---
  deleteGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.deleteGroup),
      mergeMap(({ groupId }) =>
        this.groupsService.deleteGroup(groupId).pipe(
          map(() => GroupsActions.deleteGroupSuccess({ groupId })),
          catchError((error) =>
            of(
              GroupsActions.deleteGroupFailure({
                error: this.createError(error, GroupsErrorSource.DELETE),
              })
            )
          )
        )
      )
    )
  );

  // --- MEMBERS ---
  addMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.addMember),
      concatMap(({ groupId, request }) =>
        this.groupsService.addUserToGroup(groupId, request.targetUserId).pipe(
          map((group) => GroupsActions.addMemberSuccess({ group })),
          catchError((error) =>
            of(
              GroupsActions.addMemberFailure({
                error: this.createError(error, GroupsErrorSource.ADD_MEMBER),
              })
            )
          )
        )
      )
    )
  );

  removeMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.removeMember),
      concatMap(({ groupId, request }) =>
        this.groupsService.removeUserFromGroup(groupId, request.targetUserId).pipe(
          map((group) => GroupsActions.removeMemberSuccess({ group })),
          catchError((error) =>
            of(
              GroupsActions.removeMemberFailure({
                error: this.createError(error, GroupsErrorSource.REMOVE_MEMBER),
              })
            )
          )
        )
      )
    )
  );

  /**
   * Helper to construct the GroupsError object using the ErrorHandlerService.
   */
  private createError(error: unknown, source: GroupsErrorSource): GroupsError {
    return {
      message: this.errorHandler.classifyError(error),
      source,
    };
  }
}
