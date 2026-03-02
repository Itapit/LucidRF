import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of, switchMap } from 'rxjs';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { TeamsService } from '../services/teams.service';
import { TeamsActions } from './teams.actions';

import { Action } from '@ngrx/store';
import { TeamsError } from '../dto/teams-error';
import { TeamsErrorSource } from '../dto/teams-error-source.enum';

@Injectable()
export class TeamsEffects {
  private actions$ = inject(Actions);
  private teamsService = inject(TeamsService);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * TRIGGER: Automatically dispatch this action when the effect is initialized.
   * This ensures teams load as soon as this module is lazy-loaded after login.
   */
  ngrxOnInitEffects(): Action {
    return TeamsActions.loadTeams();
  }

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
                error: this.createError(error, TeamsErrorSource.LOAD),
              })
            );
          })
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
                error: this.createError(error, TeamsErrorSource.CREATE),
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
                error: this.createError(error, TeamsErrorSource.UPDATE),
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
                error: this.createError(error, TeamsErrorSource.DELETE),
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
                error: this.createError(error, TeamsErrorSource.ADD_MEMBER),
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
                error: this.createError(error, TeamsErrorSource.REMOVE_MEMBER),
              })
            )
          )
        )
      )
    )
  );

  /**
   * Helper to construct the TeamsError object using the ErrorHandlerService.
   */
  private createError(error: unknown, source: TeamsErrorSource): TeamsError {
    return {
      message: this.errorHandler.classifyError(error),
      source,
    };
  }
}
