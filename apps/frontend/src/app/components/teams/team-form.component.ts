import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto } from '@LucidRF/common';
import { ModalWrapperComponent } from '../../components/shared/modals/modal-wrapper.component';
import { DialogAction, DialogResult } from '../shared/modals/dialog.types';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-form.component.html',
})
export class TeamFormComponent implements OnInit {
  @Input() set team(val: TeamDto | null) {
    this.initTeamData(val);
  }
  @Input() showDangerZone = false;

  @Output() cancelForm = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<{ name: string; description: string }>();
  @Output() deleteTeam = new EventEmitter<void>();

  isEdit = false;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
  });

  dialogRef = inject<DialogRef<DialogResult>>(DialogRef, { optional: true });
  data: { team: TeamDto | null; showDangerZone?: boolean } | null = inject(DIALOG_DATA, {
    optional: true,
  });

  ngOnInit() {
    if (this.data) {
      this.initTeamData(this.data.team);
      if (this.data.showDangerZone !== undefined) {
        this.showDangerZone = this.data.showDangerZone;
      }
    }
  }

  private initTeamData(val: TeamDto | null) {
    if (val) {
      this.isEdit = true;
      this.form.patchValue({ name: val.name, description: val.description || '' });
    } else {
      this.isEdit = false;
      this.form.reset();
    }
  }

  onCancel() {
    this.cancelForm.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onDeleteTeam() {
    this.deleteTeam.emit();
    if (this.dialogRef) {
      this.dialogRef.close({ action: DialogAction.DELETE });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.submitForm.emit(value);
      if (this.dialogRef) {
        this.dialogRef.close({ action: DialogAction.SUBMIT, data: value });
      }
    }
  }
}
