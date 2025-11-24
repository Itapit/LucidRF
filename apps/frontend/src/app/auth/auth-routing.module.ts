import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from '../core/navigation/app-routes.enum';
import { CompleteSetupComponent } from './complete-setup/complete-setup.component';
import { loggedOutGuard } from './infrastructure/guards/logged-out.guard';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: AppRoute.LOGIN,
    component: LoginComponent,
    canActivate: [loggedOutGuard],
  },
  {
    path: AppRoute.COMPLETE_SETUP,
    component: CompleteSetupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
