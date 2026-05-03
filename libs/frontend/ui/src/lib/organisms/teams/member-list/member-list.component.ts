import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolePermissions, TeamDto, TeamPermission, TeamRole } from '@LucidRF/common';
import { ButtonComponent, InputDirective, SelectDirective } from '../../../atoms';
import { DialogResult, ModalWrapperComponent } from '../../../molecules';

import { ComponentSize } from '../../../types';

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

  TeamRole = TeamRole;
  ComponentSize = ComponentSize;

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

  private hasPermission(permission: TeamPermission): boolean {
    const role = this._currentUserRole();
    if (!role) return false;
    return RolePermissions[role]?.includes(permission) ?? false;
  }

  // Permissions getters
  get canInvite(): boolean {
    return this.hasPermission(TeamPermission.ADD_MEMBER);
  }

  canRemove(targetRole: TeamRole, targetId: string): boolean {
    const currentId = this._currentUserId();
    if (currentId === targetId) return false;

    if (targetRole === TeamRole.OWNER) return this.hasPermission(TeamPermission.REMOVE_OWNER);
    if (targetRole === TeamRole.MANAGER) return this.hasPermission(TeamPermission.REMOVE_MANAGER);
    return this.hasPermission(TeamPermission.REMOVE_MEMBER);
  }

  canChangeRole(targetRole: TeamRole, targetId: string): boolean {
    const currentId = this._currentUserId();
    if (currentId === targetId) return false; // Self-demotion not supported via UI yet

    // To even open the dropdown, you need to be able to DEMOTE them
    if (targetRole === TeamRole.OWNER) return this.hasPermission(TeamPermission.DEMOTE_OWNER);
    if (targetRole === TeamRole.MANAGER) return this.hasPermission(TeamPermission.DEMOTE_MANAGER);

    // If they are a MEMBER, you only need the ability to PROMOTE them to *something*
    return this.hasPermission(TeamPermission.PROMOTE_TO_MANAGER) || this.hasPermission(TeamPermission.PROMOTE_TO_OWNER);
  }

  getAvailableRoles(): TeamRole[] {
    const currentRole = this._currentUserRole();
    if (!currentRole) return [];

    const available: TeamRole[] = [TeamRole.MEMBER];

    if (this.hasPermission(TeamPermission.PROMOTE_TO_MANAGER) || this.hasPermission(TeamPermission.DEMOTE_MANAGER)) {
      available.push(TeamRole.MANAGER);
    }

    if (this.hasPermission(TeamPermission.PROMOTE_TO_OWNER) || this.hasPermission(TeamPermission.DEMOTE_OWNER)) {
      available.push(TeamRole.OWNER);
    }

    // Sort conventionally: Owner -> Manager -> Member
    const order = { [TeamRole.OWNER]: 0, [TeamRole.MANAGER]: 1, [TeamRole.MEMBER]: 2 };
    return available.sort((a, b) => order[a] - order[b]);
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
