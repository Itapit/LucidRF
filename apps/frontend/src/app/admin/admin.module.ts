import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [AdminCreateUserComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    ButtonModule,
    MessageModule,
    InputGroupAddon,
    SelectModule,
  ],
})
export class AdminModule {}
