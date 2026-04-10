
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-admin-sidebar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {
  activeTab = input<'users' | 'settings'>('users');
  tabClick = output<'users' | 'settings'>();
}
