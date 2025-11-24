import { Component } from '@angular/core';
import { GroupsModule } from '../groups/groups-module';

@Component({
  selector: 'app-dashboard',
  imports: [GroupsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
