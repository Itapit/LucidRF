import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto, TeamRole } from '@LucidRF/common';
import { ModalWrapperComponent } from '../../components/shared/modals/modal-wrapper.component';
import { DialogResult } from '../shared/modals/dialog.types';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit {
  @Input() set initialData(val: { team: TeamDto | null; currentUserRole: TeamRole | null; currentUserId: string }) {
    if (val) {
      this.team = val.team;
      this.currentUserRole = val.currentUserRole;
      this.currentUserId = val.currentUserId;
    }
  }

  @Input() team: TeamDto | null = null;
  @Input() currentUserRole: TeamRole | null = null;
  @Input() currentUserId = '';

  @Output() closeList = new EventEmitter<void>();
  @Output() inviteMember = new EventEmitter<string>();
  @Output() removeMember = new EventEmitter<string>();
  @Output() updateRole = new EventEmitter<{ userId: string; role: TeamRole }>();

  identifierInput = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  dialogRef = inject<DialogRef<DialogResult>>(DialogRef, { optional: true });
  data: { team: TeamDto | null; currentUserRole: TeamRole | null; currentUserId: string } | null = inject(DIALOG_DATA, {
    optional: true,
  });

  ngOnInit() {
    if (this.data) {
      this.team = this.data.team;
      this.currentUserRole = this.data.currentUserRole;
      this.currentUserId = this.data.currentUserId;
    }
  }

  onClose() {
    this.closeList.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onRemoveMember(userId: string) {
    this.removeMember.emit(userId);
  }

  // Permissions getters
  get canInvite(): boolean {
    return this.currentUserRole === TeamRole.OWNER || this.currentUserRole === TeamRole.MANAGER;
  }

  canRemove(targetRole: TeamRole, targetId: string): boolean {
    if (this.currentUserId === targetId) return false;
    if (this.currentUserRole === TeamRole.OWNER) return true;
    if (this.currentUserRole === TeamRole.MANAGER && targetRole === TeamRole.MEMBER) return true;
    return false;
  }

  canChangeRole(targetRole: TeamRole, targetId: string): boolean {
    if (this.currentUserId === targetId) return false; // Self-demotion not supported via UI yet
    if (this.currentUserRole === TeamRole.OWNER) return true;
    // Managers can change roles of members/managers, but cannot touch owners or promote to owner
    if (this.currentUserRole === TeamRole.MANAGER && targetRole !== TeamRole.OWNER) return true;
    return false;
  }

  getAvailableRoles(): TeamRole[] {
    if (this.currentUserRole === TeamRole.OWNER) {
      return [TeamRole.OWNER, TeamRole.MANAGER, TeamRole.MEMBER];
    }
    if (this.currentUserRole === TeamRole.MANAGER) {
      return [TeamRole.MANAGER, TeamRole.MEMBER];
    }
    return [];
  }

  onInvite() {
    if (this.identifierInput.valid) {
      this.inviteMember.emit(this.identifierInput.value);
      this.identifierInput.reset();
    }
  }

  onRoleChange(userId: string, newRole: string) {
    this.updateRole.emit({ userId, role: newRole as TeamRole });
  }
}
