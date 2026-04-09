import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FilesEffects } from './store/files.effects';
import { filesFeature } from './store/files.reducer';

@NgModule({
  declarations: [],
  imports: [CommonModule, StoreModule.forFeature(filesFeature), EffectsModule.forFeature([FilesEffects])],
})
export class FilesModule {}
