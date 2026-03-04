import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto, TeamRole } from '@LucidRF/common';
import { ButtonComponent } from '../../../atoms';
import { InputDirective } from '../../../atoms';
import { SelectDirective } from '../../../atoms';
import { DialogResult } from '../../../molecules';
import { ModalWrapperComponent } from '../../../molecules';

@Component({
  selector: 'ui-member-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalWrapperComponent,
    ButtonComponent,
    InputDirective,
    SelectDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit {
  initialData = input<{ team: TeamDto | null; currentUserRole: TeamRole | null; currentUserId: string }>();
  team = input<TeamDto | null>(null);
  currentUserRole = input<TeamRole | null>(null);
  currentUserId = input<string>('');

  closeList = output<void>();
  inviteMember = output<string>();
  removeMember = output<string>();
  updateRole = output<{ userId: string; role: TeamRole }>();

  _team = signal<TeamDto | null>(null);
  _currentUserRole = signal<TeamRole | null>(null);
  _currentUserId = signal<string>('');

  identifierInput = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  dialogRef = inject<DialogRef<DialogResult>>(DialogRef, { optional: true });
  data: { team: TeamDto | null; currentUserRole: TeamRole | null; currentUserId: string } | null = inject(DIALOG_DATA, {
    optional: true,
  });

  constructor() {
    effect(
      () => {
        const init = this.initialData();
        if (init) {
          this._team.set(init.team);
          this._currentUserRole.set(init.currentUserRole);
          this._currentUserId.set(init.currentUserId);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const teamVal = this.team();
        if (teamVal) this._team.set(teamVal);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const role = this.currentUserRole();
        if (role) this._currentUserRole.set(role);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const id = this.currentUserId();
        if (id) this._currentUserId.set(id);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    if (this.data) {
      this._team.set(this.data.team);
      this._currentUserRole.set(this.data.currentUserRole);
      this._currentUserId.set(this.data.currentUserId);
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
    const role = this._currentUserRole();
    return role === TeamRole.OWNER || role === TeamRole.MANAGER;
  }

  canRemove(targetRole: TeamRole, targetId: string): boolean {
    const currentId = this._currentUserId();
    const currentRole = this._currentUserRole();
    if (currentId === targetId) return false;
    if (currentRole === TeamRole.OWNER) return true;
    if (currentRole === TeamRole.MANAGER && targetRole === TeamRole.MEMBER) return true;
    return false;
  }

  canChangeRole(targetRole: TeamRole, targetId: string): boolean {
    const currentId = this._currentUserId();
    const currentRole = this._currentUserRole();
    if (currentId === targetId) return false; // Self-demotion not supported via UI yet
    if (currentRole === TeamRole.OWNER) return true;
    // Managers can change roles of members/managers, but cannot touch owners or promote to owner
    if (currentRole === TeamRole.MANAGER && targetRole !== TeamRole.OWNER) return true;
    return false;
  }

  getAvailableRoles(): TeamRole[] {
    const role = this._currentUserRole();
    if (role === TeamRole.OWNER) {
      return [TeamRole.OWNER, TeamRole.MANAGER, TeamRole.MEMBER];
    }
    if (role === TeamRole.MANAGER) {
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
