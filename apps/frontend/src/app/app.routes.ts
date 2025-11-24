import { Routes } from '@angular/router';
import { adminGuard } from './auth/infrastructure/guards/admin.guard';
import { loggedInGuard } from './auth/infrastructure/guards/logged-in.guard';
import { AppRoute } from './core/navigation/app-routes.enum';
import { DashboardComponent } from './dashboard/dashboard.component';

export const appRoutes: Routes = [
  {
    path: AppRoute.AUTH,
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: AppRoute.ADMIN,
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
    canMatch: [adminGuard],
  },
  {
    path: AppRoute.DASHBOARD,
    component: DashboardComponent,
    canActivate: [loggedInGuard],
  },
  {
    path: AppRoute.ROOT,
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: AppRoute.NOT_FOUND,
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
