export const environment = {
  BACKEND_BASE_URL: 'http://localhost:3000/api',
  FRONTEND_BASE_URL: 'http://localhost:4200',
  /**
   * Grafana embed: full path /d/{uid}/{slug} loads this dashboard only; kiosk=tv hides Grafana chrome.
   * Slug matches Grafana’s URL for “NodeJS Application Dashboard” (see grafana/dashboards/nestjs-dashboard.json).
   */
  GRAFANA_DASHBOARD_EMBED_URL:
    'http://localhost:3100/d/PTSqcpJWk/nodejs-application-dashboard?orgId=1&kiosk=tv&theme=light',
  production: false,
};
