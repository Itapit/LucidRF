import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent, AdminTab, DashboardLayoutComponent } from '@LucidRF/ui';
import { NavigationService } from '../../../core/navigation/navigation.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, DashboardLayoutComponent, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminLayoutComponent {
  private navigationService = inject(NavigationService);
  
  get activeTab(): AdminTab {
    return this.navigationService.isActiveAdminTab(AdminTab.Monitoring) ? AdminTab.Monitoring : AdminTab.Users;
  }

  onTabClick(tab: AdminTab) {
    if (tab === AdminTab.Users) {
      this.navigationService.toAdminUsers();
    } else {
      this.navigationService.toAdminMonitoring();
    }
  }
}
