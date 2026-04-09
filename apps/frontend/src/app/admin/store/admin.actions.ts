import { CreateUserRequest, UserDto } from '@LucidRF/common';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ActionError } from '../../core/store/action-error.interface';
import { AdminErrorSource } from '../dtos/admin-error-source.enum';

export const AdminActions = createActionGroup({
  source: 'Admin',
  events: {
    // Load Users
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: UserDto[] }>(),
    'Load Users Failure': props<{ error: ActionError<AdminErrorSource> }>(),

    // Create User
    'Create User': props<{ request: CreateUserRequest }>(),
    'Create User Success': props<{ user: UserDto }>(),
    'Create User Failure': props<{ error: ActionError<AdminErrorSource> }>(),

    // Delete User
    'Delete User': props<{ id: string }>(),
    'Delete User Success': props<{ id: string }>(),
    'Delete User Failure': props<{ error: ActionError<AdminErrorSource>; id: string }>(),
  },
});
