import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AdminSidebarComponent,
  AdminUsersTableComponent,
  DashboardLayoutComponent,
  UserCreateModalComponent,
} from '@LucidRF/ui';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { AdminUsersStore } from './admin-users.store';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    AdminSidebarComponent,
    AdminUsersTableComponent,
    UserCreateModalComponent,
  ],
  providers: [AdminUsersStore],
  templateUrl: './admin-users.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminUsersComponent implements OnInit {
  private navigationService = inject(NavigationService);
  store = inject(AdminUsersStore);

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
}
