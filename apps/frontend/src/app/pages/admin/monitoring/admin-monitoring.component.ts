import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-monitoring',
  standalone: true,
  imports: [],
  templateUrl: './admin-monitoring.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminMonitoringComponent {
  private sanitizer = inject(DomSanitizer);
  readonly grafanaUrl = environment.GRAFANA_DASHBOARD_EMBED_URL;

  /** Grafana dashboard embed (Prometheus-backed metrics from the gateway). */
  readonly grafanaEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    environment.GRAFANA_DASHBOARD_EMBED_URL
  );

  openGrafanaInNewTab() {
    window.open(this.grafanaUrl, '_blank', 'noopener');
  }
}
