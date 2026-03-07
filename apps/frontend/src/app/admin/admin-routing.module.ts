import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from '../core/navigation/app-routes.enum';

const routes: Routes = [
  { path: '', redirectTo: AppRoute.ADMIN_USERS, pathMatch: 'full' },
  {
    path: AppRoute.ADMIN_USERS,
    loadComponent: () => import('../pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
