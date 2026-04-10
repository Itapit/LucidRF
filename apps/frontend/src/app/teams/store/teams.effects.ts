import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of, switchMap } from 'rxjs';
import { AuthActions } from '../../auth/store/auth.actions';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { TeamsService } from '../services/teams.service';
import { TeamsActions } from './teams.actions';

import { TeamsErrorSource } from '../dto/teams-error-source.enum';

@Injectable()
export class TeamsEffects {
  private actions$ = inject(Actions);
  private teamsService = inject(TeamsService);
  private errorHandler = inject(ErrorHandlerService);

  // --- INIT / AUTH ---
  loadTeamsOnLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMeSuccess),
      map(() => TeamsActions.loadTeams())
    )
  );

  // --- LOAD ---
  loadTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.loadTeams),
      switchMap(() =>
        this.teamsService.loadTeams().pipe(
          map((teams) => TeamsActions.loadTeamsSuccess({ teams })),
          catchError((error) => {
            return of(
              TeamsActions.loadTeamsFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.LOAD),
              })
            );
          })
        )
      )
    )
  );

  loadTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.loadTeam),
      switchMap(({ teamId }) =>
        this.teamsService.getTeamById(teamId).pipe(
          map((team) => TeamsActions.loadTeamSuccess({ team })),
          catchError((error) =>
            of(
              TeamsActions.loadTeamFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.LOAD),
              })
            )
          )
        )
      )
    )
  );

  // --- CREATE ---
  createTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.createTeam),
      concatMap(({ request }) =>
        this.teamsService.createTeam(request).pipe(
          map((team) => {
            return TeamsActions.createTeamSuccess({ team });
          }),
          catchError((error) =>
            of(
              TeamsActions.createTeamFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.CREATE),
              })
            )
          )
        )
      )
    )
  );

  // --- UPDATE ---
  updateTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.updateTeam),
      concatMap(({ teamId, request }) =>
        this.teamsService.updateTeam(teamId, request).pipe(
          map((team) => TeamsActions.updateTeamSuccess({ team })),
          catchError((error) =>
            of(
              TeamsActions.updateTeamFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.UPDATE),
              })
            )
          )
        )
      )
    )
  );

  // --- DELETE ---
  deleteTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.deleteTeam),
      mergeMap(({ teamId }) =>
        this.teamsService.deleteTeam(teamId).pipe(
          map(() => TeamsActions.deleteTeamSuccess({ teamId })),
          catchError((error) =>
            of(
              TeamsActions.deleteTeamFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.DELETE),
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
      ofType(TeamsActions.addMember),
      concatMap(({ teamId, request }) =>
        this.teamsService.addUserToTeam(teamId, request).pipe(
          map((team) => TeamsActions.addMemberSuccess({ team })),
          catchError((error) =>
            of(
              TeamsActions.addMemberFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.ADD_MEMBER),
              })
            )
          )
        )
      )
    )
  );

  removeMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.removeMember),
      concatMap(({ teamId, request }) =>
        this.teamsService.removeUserFromTeam(teamId, request).pipe(
          map((team) => TeamsActions.removeMemberSuccess({ team })),
          catchError((error) =>
            of(
              TeamsActions.removeMemberFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.REMOVE_MEMBER),
              })
            )
          )
        )
      )
    )
  );

  updateMemberRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.updateMemberRole),
      concatMap(({ teamId, targetUserId, request }) =>
        this.teamsService.updateUserRole(teamId, targetUserId, request).pipe(
          map((team) => TeamsActions.updateMemberRoleSuccess({ team })),
          catchError((error) =>
            of(
              TeamsActions.updateMemberRoleFailure({
                error: this.errorHandler.classifyActionError(error, TeamsErrorSource.UPDATE_MEMBER),
              })
            )
          )
        )
      )
    )
  );
}
