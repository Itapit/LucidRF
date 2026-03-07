import { ConnectedPosition } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, ViewChild } from '@angular/core';
import { UserDto } from '@LucidRF/common';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { DropdownItemComponent } from '../dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'ui-profile-menu',
  standalone: true,
  imports: [CommonModule, AvatarComponent, DropdownComponent, DropdownItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-menu.component.html',
})
export class ProfileMenuComponent {
  user = input<UserDto | null>(null);
  logout = output<void>();
  editProfile = output<void>();

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
