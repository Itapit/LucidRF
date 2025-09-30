import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from 'primeng/config';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { AuthModule } from './auth/auth-module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    AuthModule,
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ logOnly: !isDevMode() }),
    StoreModule.forRoot(
      {},
      {
        metaReducers: [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    StoreRouterConnectingModule.forRoot(),
  ],
  bootstrap: [AppComponent],
  providers: [
    providePrimeNG({
      theme: { preset: Lara, options: { darkModeSelector: 'light' } },
      ripple: true,
    }),
  ],
})
export class AppModule {}
