import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent, DashboardLayoutComponent, TopHeaderComponent } from '@LucidRF/ui';
import { AuthFacade } from '../../../auth/store/auth.facade';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopHeaderComponent, AdminSidebarComponent, DashboardLayoutComponent],
  templateUrl: './admin-layout.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminLayoutComponent {
  private authFacade = inject(AuthFacade);
  private router = inject(Router);

  user$ = this.authFacade.user$;

  get activeTab(): 'users' | 'settings' {
    return this.router.url.includes('/admin/settings') ? 'settings' : 'users';
  }

  onTabClick(tab: 'users' | 'settings') {
    this.router.navigate(['/admin', tab]);
  }

  onLogout() {
    this.authFacade.logout();
  }
}
