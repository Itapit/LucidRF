import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AdminTab } from '../../types';

@Component({
  selector: 'ui-admin-sidebar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {
  AdminTab = AdminTab;
  activeTab = input<AdminTab>(AdminTab.Users);
  tabClick = output<AdminTab>();
}
