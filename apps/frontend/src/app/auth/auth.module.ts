import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { CompleteSetupComponent } from './complete-setup/complete-setup.component';
import { LoginComponent } from './login/login.component';
import { AuthFacade } from './store/auth.facade';

@NgModule({
  declarations: [LoginComponent, CompleteSetupComponent],
  imports: [CommonModule, AuthRoutingModule, ReactiveFormsModule],
  providers: [AuthFacade],
})
export class AuthModule {}
