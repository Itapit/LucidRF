import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TeamDto } from '@LucidRF/common';
import { SidebarItem } from './sidebar.types';

@Component({
  selector: 'app-global-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-sidebar.component.html',
})
export class GlobalSidebarComponent {
  @Input() teams: TeamDto[] = [];
  @Input() isAdmin = false;

  // Navigation active state
  @Input() activeItem: SidebarItem = SidebarItem.HOME;
  @Input() activeTeamId?: string;

  @Output() goHome = new EventEmitter<void>();
  @Output() goWorkspace = new EventEmitter<void>();
  @Output() goTeam = new EventEmitter<string>();
  @Output() goAdmin = new EventEmitter<void>();
  @Output() uploadClick = new EventEmitter<void>();
}
