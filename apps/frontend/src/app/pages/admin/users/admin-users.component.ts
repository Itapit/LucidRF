import { Dialog, DialogModule, DialogRef } from '@angular/cdk/dialog';

import { Component, effect, inject, OnInit } from '@angular/core';
import {
  AdminSidebarComponent,
  AdminUsersTableComponent,
  DashboardLayoutComponent,
  UserCreateModalComponent,
  UserCreateModalData,
} from '@LucidRF/ui';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { AdminUsersStore } from './admin-users.store';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DialogModule, DashboardLayoutComponent, AdminSidebarComponent, AdminUsersTableComponent],
  providers: [AdminUsersStore],
  templateUrl: './admin-users.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminUsersComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private dialog = inject(Dialog);
  store = inject(AdminUsersStore);

  private dialogRef: DialogRef<void> | null = null;

  constructor() {
    effect(() => {
      if (!this.store.isCreateModalOpen() && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    });
  }

  ngOnInit(): void {
    this.store.loadUsers();
  }

  get activeTab(): 'users' | 'settings' {
    return this.navigationService.isActiveAdminTab('settings') ? 'settings' : 'users';
  }

  onTabClick(tab: 'users' | 'settings') {
    if (tab === 'users') {
      this.navigationService.toAdminUsers();
    } else {
      this.navigationService.toAdminSettings();
    }
  }

  openCreateUserModal() {
    this.store.openModal();
    this.dialogRef = this.dialog.open<void, UserCreateModalData>(UserCreateModalComponent, {
      data: {
        isSubmitting: this.store.isCreating,
        error: this.store.createError,
        onSubmit: (data) => {
          this.store.createUser(data);
        },
      },
    });

    this.dialogRef?.closed.subscribe(() => {
      this.store.closeModal();
      this.dialogRef = null;
    });
  }
}
