import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AdminErrorSource } from '../dtos/admin-error-source.enum';
import { AdminService } from '../services/admin.service';
import { AdminActions } from './admin.actions';

@Injectable()
export class AdminEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);

  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      switchMap(() =>
        this.adminService.getAllUsers().pipe(
          map((users) => AdminActions.loadUsersSuccess({ users })),
          catchError((error: HttpErrorResponse) =>
            of(
              AdminActions.loadUsersFailure({
                error: {
                  message: error.error?.message || 'Failed to load users',
                  source: AdminErrorSource.LOAD_USERS,
                },
              })
            )
          )
        )
      )
    );
  });

  createUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AdminActions.createUser),
      switchMap(({ request }) =>
        this.adminService.createUser(request).pipe(
          map((user) => AdminActions.createUserSuccess({ user })),
          catchError((error: HttpErrorResponse) =>
            of(
              AdminActions.createUserFailure({
                error: {
                  message: error.error?.message || 'Failed to create user',
                  source: AdminErrorSource.CREATE_USER,
                },
              })
            )
          )
        )
      )
    );
  });

  deleteUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AdminActions.deleteUser),
      switchMap(({ id }) =>
        this.adminService.deleteUser(id).pipe(
          map(() => AdminActions.deleteUserSuccess({ id })),
          catchError((error: HttpErrorResponse) =>
            of(
              AdminActions.deleteUserFailure({
                id,
                error: {
                  message: error.error?.message || 'Failed to delete user',
                  source: AdminErrorSource.DELETE_USER,
                },
              })
            )
          )
        )
      )
    );
  });
}
