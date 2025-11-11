import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompleteSetupComponent } from './complete-setup/complete-setup.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'complete-setup',
    component: CompleteSetupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
