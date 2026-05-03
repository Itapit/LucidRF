import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from '../core/navigation/app-routes.enum';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: AppRoute.ADMIN_USERS, pathMatch: 'full' },
      {
        path: AppRoute.ADMIN_USERS,
        loadComponent: () => import('../pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: AppRoute.ADMIN_MONITORING,
        loadComponent: () =>
          import('../pages/admin/monitoring/admin-monitoring.component').then((m) => m.AdminMonitoringComponent),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
