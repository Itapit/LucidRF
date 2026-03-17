import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { ChangeDetectionStrategy, Component, OnInit, Signal, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto } from '@LucidRF/common';
import { ButtonComponent, InputDirective } from '../../../atoms';
import {
  AlertComponent,
  DialogAction,
  DialogResult,
  FormFieldComponent,
  ModalWrapperComponent,
} from '../../../molecules';

export interface TeamFormData {
  team: TeamDto | null;
  showDangerZone?: boolean;
  isSubmitting?: Signal<boolean>;
  error?: Signal<string | null>;
  onSubmit?: (data: { name: string; description: string }) => void;
}

@Component({
  selector: 'ui-team-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalWrapperComponent,
    FormFieldComponent,
    InputDirective,
    ButtonComponent,
    AlertComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-form.component.html',
})
export class TeamFormComponent implements OnInit {
  cancelForm = output<void>();
  submitForm = output<{ name: string; description: string }>();
  deleteTeam = output<void>();

  isEdit = false;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
  });

  dialogRef = inject<DialogRef<DialogResult>>(DialogRef, { optional: true });
  data = inject<TeamFormData>(DIALOG_DATA, { optional: true });

  showDangerZone = this.data?.showDangerZone || false;
  isSubmitting = this.data?.isSubmitting || signal(false);
  error = this.data?.error || signal(null);

  ngOnInit() {
    if (this.data) {
      this.initTeamData(this.data.team);
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

      if (this.data?.onSubmit) {
        this.data.onSubmit(value);
      } else {
        this.submitForm.emit(value);
        if (this.dialogRef) {
          this.dialogRef.close({ action: DialogAction.SUBMIT, data: value });
        }
      }
    }
  }
}
