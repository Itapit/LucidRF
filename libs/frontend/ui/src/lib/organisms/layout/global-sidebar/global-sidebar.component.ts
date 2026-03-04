import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TeamDto } from '@LucidRF/common';
import { SidebarItem } from '../types/sidebar.types';

@Component({
  selector: 'ui-global-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-sidebar.component.html',
})
export class GlobalSidebarComponent {
  teams = input<TeamDto[]>([]);
  isAdmin = input<boolean>(false);

  // Navigation active state
  activeItem = input<SidebarItem>(SidebarItem.HOME);
  activeTeamId = input<string | undefined>();

  goHome = output<void>();
  goWorkspace = output<void>();
  goTeam = output<string>();
  goAdmin = output<void>();
  uploadClick = output<void>();

  SidebarItem = SidebarItem;
}
