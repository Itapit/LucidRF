import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SystemRole, UserDto, UserStatus } from '@LucidRF/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ModalWrapperComponent } from '../../molecules/modal-wrapper/modal-wrapper.component';

@Component({
  selector: 'ui-admin-users-table',
  imports: [CommonModule, ModalWrapperComponent, ButtonComponent],
  standalone: true,
  templateUrl: './admin-users-table.component.html',
})
export class AdminUsersTableComponent {
  @Input() users: UserDto[] = [];
  @Input() isLoading = false;
  @Input() deletingIds: Record<string, boolean> = {};

  @Output() delete = new EventEmitter<string>();

  SystemRole = SystemRole;
  UserStatus = UserStatus;
  userToDeleteId: string | null = null;

  onDelete(id: string) {
    this.userToDeleteId = id;
  }

  confirmDelete() {
    if (this.userToDeleteId) {
      this.delete.emit(this.userToDeleteId);
      this.userToDeleteId = null;
    }
  }

  cancelDelete() {
    this.userToDeleteId = null;
  }
}
