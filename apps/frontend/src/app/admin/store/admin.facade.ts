import { inject, Injectable } from '@angular/core';
import { CreateUserRequest } from '@LucidRF/common';
import { Store } from '@ngrx/store';
import { AdminActions } from './admin.actions';
import * as AdminSelectors from './admin.selectors';

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly store = inject(Store);

  // Selectors
  users$ = this.store.select(AdminSelectors.selectAllUsers);
  loading$ = this.store.select(AdminSelectors.selectAdminLoading);
  loaded$ = this.store.select(AdminSelectors.selectAdminLoaded);
  error$ = this.store.select(AdminSelectors.selectAdminError);

  // Actions
  loadUsers() {
    this.store.dispatch(AdminActions.loadUsers());
  }

  createUser(request: CreateUserRequest) {
    this.store.dispatch(AdminActions.createUser({ request }));
  }

  deleteUser(id: string) {
    this.store.dispatch(AdminActions.deleteUser({ id }));
  }
}
