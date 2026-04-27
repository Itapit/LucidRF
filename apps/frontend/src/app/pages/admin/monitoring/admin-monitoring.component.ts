import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdminSidebarComponent, AdminTab, DashboardLayoutComponent } from '@LucidRF/ui';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-monitoring',
  standalone: true,
  imports: [DashboardLayoutComponent, AdminSidebarComponent],
  templateUrl: './admin-monitoring.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminMonitoringComponent {
  private navigationService = inject(NavigationService);
  private sanitizer = inject(DomSanitizer);
  readonly grafanaUrl = environment.GRAFANA_DASHBOARD_EMBED_URL;
  AdminTab = AdminTab;

  /** Grafana dashboard embed (Prometheus-backed metrics from the gateway). */
  readonly grafanaEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    environment.GRAFANA_DASHBOARD_EMBED_URL
  );

  get activeTab(): AdminTab {
    return AdminTab.Monitoring;
  }

  onTabClick(tab: AdminTab) {
    if (tab === AdminTab.Users) {
      this.navigationService.toAdminUsers();
    } else {
      this.navigationService.toAdminMonitoring();
    }
  }

  openGrafanaInNewTab() {
    window.open(this.grafanaUrl, '_blank', 'noopener');
  }
}
