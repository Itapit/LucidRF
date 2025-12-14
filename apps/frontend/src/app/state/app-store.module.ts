import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthEffects } from '../auth/store/auth.effects';
import { authFeature } from '../auth/store/auth.reducer';
import { coreFeature } from '../core/store/core.reducer';
import { environment } from '../environments/environment';
import { AppInitEffects } from './app-init.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    // router store
    StoreModule.forRoot({
      router: routerReducer,
      [coreFeature.name]: coreFeature.reducer,
      [authFeature.name]: authFeature.reducer,
    }),

    // init effects
    EffectsModule.forRoot([AppInitEffects, AuthEffects]),

    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),

    // devtool
    StoreDevtoolsModule.instrument({
      name: 'LucidRF',
      maxAge: 25,
      logOnly: environment.production,
      trace: true,
      traceLimit: 75,
    }),
  ],
})
export class AppStoreModule {}
