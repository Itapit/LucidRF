import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { GroupsEffects } from './store/groups.effects';
import { groupsFeature } from './store/groups.reducer';

@NgModule({
  declarations: [],
  imports: [CommonModule, StoreModule.forFeature(groupsFeature), EffectsModule.forFeature([GroupsEffects])],
})
export class GroupsModule {}
