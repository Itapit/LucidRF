import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TeamDto, UserDto } from '@LucidRF/common';
import { ProfileMenuComponent } from '../../molecules/profile-menu/profile-menu.component';
import { SidebarItem } from './sidebar.types';

@Component({
  selector: 'ui-global-sidebar',
  standalone: true,
  imports: [CommonModule, ProfileMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-sidebar.component.html',
})
export class GlobalSidebarComponent {
  teams = input<TeamDto[]>([]);
  isAdmin = input<boolean>(false);
  user = input<UserDto | null>(null);

  // Navigation active state
  activeItem = input<SidebarItem>(SidebarItem.HOME);
  activeTeamId = input<string | undefined>();

  goHome = output<void>();
  goWorkspace = output<void>();
  goTeam = output<string>();
  goAdmin = output<void>();
  uploadClick = output<void>();
  logout = output<void>();
  editProfile = output<void>();

  SidebarItem = SidebarItem;
}
