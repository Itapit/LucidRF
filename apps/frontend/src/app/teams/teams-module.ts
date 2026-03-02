import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TeamsEffects } from './store/teams.effects';
import { teamsFeature } from './store/teams.reducer';

@NgModule({
  declarations: [],
  imports: [CommonModule, StoreModule.forFeature(teamsFeature), EffectsModule.forFeature([TeamsEffects])],
})
export class TeamsModule {}
