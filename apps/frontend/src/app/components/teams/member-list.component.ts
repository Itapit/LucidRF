import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto } from '@LucidRF/common';
import { ModalWrapperComponent } from '../../components/shared/modals/modal-wrapper.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './member-list.component.html',
})
export class MemberListComponent {
  @Input() team: TeamDto | null = null;
  @Input() isOwner = false;
  @Input() currentUserId = '';

  @Output() close = new EventEmitter<void>();
  @Output() inviteMember = new EventEmitter<string>();
  @Output() removeMember = new EventEmitter<string>();

  userIdInput = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  onInvite() {
    if (this.userIdInput.valid) {
      this.inviteMember.emit(this.userIdInput.value);
      this.userIdInput.reset();
    }
  }
}
