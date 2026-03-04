import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UserDto } from '@LucidRF/common';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-header.component.html',
})
export class TopHeaderComponent {
  @Input() variant: 'overview' | 'solid' = 'solid';
  @Input() user: UserDto | null = null;

  @Output() searchQuery = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
