import { Component } from '@angular/core';
import { TeamsModule } from '../teams/teams-module';

@Component({
  selector: 'app-dashboard',
  imports: [TeamsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
