import { ConnectedPosition } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UserDto } from '@LucidRF/common';
import { AvatarComponent } from '../../../atoms/avatar/avatar.component';
import { DropdownItemComponent } from '../../../molecules/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../../molecules/dropdown/dropdown.component';

@Component({
  selector: 'ui-profile-menu',
  standalone: true,
  imports: [CommonModule, AvatarComponent, DropdownComponent, DropdownItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-menu.component.html',
})
export class ProfileMenuComponent {
  @Input() user: UserDto | null = null;
  @Output() logout = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();

  @ViewChild(DropdownComponent) dropdown!: DropdownComponent;

  positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 16 },
  ];

  handleEditProfile() {
    this.editProfile.emit();
    this.dropdown.close();
  }

  handleLogout() {
    this.logout.emit();
    this.dropdown.close();
  }
}
