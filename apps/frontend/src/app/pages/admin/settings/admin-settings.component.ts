import { Component, inject } from '@angular/core';
import { AdminSidebarComponent, DashboardLayoutComponent } from '@LucidRF/ui';
import { NavigationService } from '../../../core/navigation/navigation.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [DashboardLayoutComponent, AdminSidebarComponent],
  templateUrl: './admin-settings.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminSettingsComponent {
  private navigationService = inject(NavigationService);

  get activeTab(): 'users' | 'settings' {
    return 'settings';
  }

  onTabClick(tab: 'users' | 'settings') {
    if (tab === 'users') {
      this.navigationService.toAdminUsers();
    } else {
      this.navigationService.toAdminSettings();
    }
  }
}
