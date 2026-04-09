import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CompleteSetupComponent } from '../pages/auth/complete-setup/complete-setup.component';
import { LoginComponent } from '../pages/auth/login/login.component';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthFacade } from './store/auth.facade';

@NgModule({
  imports: [CommonModule, AuthRoutingModule, ReactiveFormsModule, LoginComponent, CompleteSetupComponent],
  providers: [AuthFacade],
})
export class AuthModule {}
