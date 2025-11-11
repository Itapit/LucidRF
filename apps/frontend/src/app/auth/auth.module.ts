import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthRoutingModule } from './auth-routing.module';
import { CompleteSetupComponent } from './complete-setup/complete-setup.component';
import { LoginComponent } from './login/login.component';
import { AuthFacade } from './store/auth.facade';

@NgModule({
  declarations: [LoginComponent, CompleteSetupComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule,
    PasswordModule,
  ],
  providers: [AuthFacade],
})
export class AuthModule {}
