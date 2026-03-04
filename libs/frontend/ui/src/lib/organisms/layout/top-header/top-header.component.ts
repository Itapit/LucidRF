import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserDto } from '@LucidRF/common';
import { AvatarComponent } from '../../../atoms';

@Component({
  selector: 'ui-top-header',
  standalone: true,
  imports: [CommonModule, OverlayModule, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-header.component.html',
})
export class TopHeaderComponent {
  variant = input<'overview' | 'solid'>('solid');
  user = input<UserDto | null>(null);

  searchQuery = output<string>();
  logout = output<void>();
  editProfile = output<void>();

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
