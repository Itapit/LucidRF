import { Routes } from '@angular/router';
import { adminGuard } from './auth/infrastructure/guards/admin.guard';
import { loggedInGuard } from './auth/infrastructure/guards/logged-in.guard';
import { AppRoute } from './core/navigation/app-routes.enum';

export const appRoutes: Routes = [
  {
    path: AppRoute.AUTH,
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: AppRoute.ADMIN,
    canActivate: [loggedInGuard],
    canMatch: [adminGuard],
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: AppRoute.HOME,
    loadComponent: () => import('./pages/home/home-overview.component').then((m) => m.HomeOverviewComponent),
    canActivate: [loggedInGuard],
  },
  {
    path: `${AppRoute.TEAMS}/:id`,
    loadComponent: () => import('./pages/teams/team-detail.component').then((m) => m.TeamDetailComponent),
    canActivate: [loggedInGuard],
  },
  {
    path: AppRoute.WORKSPACE,
    loadComponent: () => import('./pages/workspace/my-workspace.component').then((m) => m.MyWorkspaceComponent),
    canActivate: [loggedInGuard],
  },
  {
    path: AppRoute.ROOT,
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: AppRoute.NOT_FOUND,
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
