import { inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CreateUserRequest } from '@LucidRF/common';
import { Actions, ofType } from '@ngrx/effects';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { AdminActions } from '../../../admin/store/admin.actions';
import { AdminFacade } from '../../../admin/store/admin.facade';

type AdminUsersUIState = {
  isCreateModalOpen: boolean;
  deletingIds: Record<string, boolean>;
  isCreating: boolean;
  createError: string | null;
};

const initialState: AdminUsersUIState = {
  isCreateModalOpen: false,
  deletingIds: {},
  isCreating: false,
  createError: null,
};

export const AdminUsersStore = signalStore(
  withState(initialState),
  withComputed((store, adminFacade = inject(AdminFacade)) => ({
    // Use toSignal to convert observables to signals
    users: toSignal(adminFacade.users$, { initialValue: [] }),
    isLoading: toSignal(adminFacade.loading$, { initialValue: false }),
    error: toSignal(adminFacade.error$, { initialValue: null }),
  })),
  withMethods((store, adminFacade = inject(AdminFacade)) => ({
    loadUsers: () => adminFacade.loadUsers(),

    createUser: (request: CreateUserRequest) => {
      patchState(store, { isCreating: true, createError: null });
      adminFacade.createUser(request);
    },

    deleteUser: (id: string) => {
      patchState(store, { deletingIds: { ...store.deletingIds(), [id]: true } });
      adminFacade.deleteUser(id);
    },

    openModal: () => patchState(store, { isCreateModalOpen: true }),
    closeModal: () => patchState(store, { isCreateModalOpen: false }),
  })),
  withHooks({
    onInit(store, actions$ = inject(Actions)) {
      actions$.pipe(ofType(AdminActions.createUserSuccess), takeUntilDestroyed()).subscribe(() => {
        patchState(store, { isCreating: false, isCreateModalOpen: false });
      });

      actions$.pipe(ofType(AdminActions.createUserFailure), takeUntilDestroyed()).subscribe(({ error }) => {
        patchState(store, { isCreating: false, createError: error.message });
      });

      actions$
        .pipe(ofType(AdminActions.deleteUserSuccess, AdminActions.deleteUserFailure), takeUntilDestroyed())
        .subscribe(({ id }) => {
          patchState(store, { deletingIds: { ...store.deletingIds(), [id]: false } });
        });
    },
  })
);
