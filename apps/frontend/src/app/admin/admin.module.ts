import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminEffects } from './store/admin.effects';
import { adminFeature } from './store/admin.reducer';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    StoreModule.forFeature(adminFeature),
    EffectsModule.forFeature([AdminEffects]),
  ],
})
export class AdminModule {}
