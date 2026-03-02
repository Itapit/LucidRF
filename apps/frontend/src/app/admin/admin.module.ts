import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [AdminCreateUserComponent],
  imports: [CommonModule, AdminRoutingModule, ReactiveFormsModule],
})
export class AdminModule {}
