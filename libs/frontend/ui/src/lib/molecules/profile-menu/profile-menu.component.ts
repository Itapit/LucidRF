import { ConnectedPosition } from '@angular/cdk/overlay';

import { ChangeDetectionStrategy, Component, input, output, ViewChild } from '@angular/core';
import { SystemRole, UserDto } from '@LucidRF/common';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { ComponentSize } from '../../types';
import { DropdownItemComponent } from '../dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'ui-profile-menu',
  standalone: true,
  imports: [AvatarComponent, DropdownComponent, DropdownItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-menu.component.html',
})
export class ProfileMenuComponent {
  user = input<UserDto | null>(null);
  logout = output<void>();
  logoutAll = output<void>();
  editProfile = output<void>();

  @ViewChild(DropdownComponent) dropdown!: DropdownComponent;

  positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 16 },
  ];

  SystemRole = SystemRole;
  ComponentSize = ComponentSize;

  handleEditProfile() {
    this.editProfile.emit();
    this.dropdown.close();
  }

  handleLogout() {
    this.logout.emit();
    this.dropdown.close();
  }

  handleLogoutAll() {
    this.logoutAll.emit();
    this.dropdown.close();
  }
}
