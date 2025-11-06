import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from 'primeng/config';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { AuthModule } from './auth/auth-module';
import { AppStoreModule } from './state/app-store.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    AppStoreModule,
    AuthModule,
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
