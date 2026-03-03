import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UserDto } from '@LucidRF/common';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-header.component.html',
})
export class TopHeaderComponent {
  @Input() variant: 'overview' | 'solid' = 'solid';
  @Input() user: UserDto | null = null;

  @Output() search = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();

  isDropdownOpen = false;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isDropdownOpen = false;
  }
}
