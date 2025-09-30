import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { AuthRoutingModule } from './auth-routing-module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthEffects } from './store/auth.effects';
import { AuthFacade } from './store/auth.facade';
import * as fromAuth from './store/auth.reducer';

@NgModule({
  declarations: [RegisterComponent, LoginComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ButtonModule,
    StoreModule.forFeature(fromAuth.AUTH_FEATURE_KEY, fromAuth.authReducer),
    EffectsModule.forFeature([AuthEffects]),
  ],
  providers: [AuthFacade],
})
export class AuthModule {}
