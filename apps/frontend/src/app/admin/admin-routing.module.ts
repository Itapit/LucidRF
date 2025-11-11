import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCreateUserComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
