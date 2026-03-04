import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto } from '@LucidRF/common';
import { ButtonComponent } from '../../../atoms';
import { FormFieldComponent } from '../../../molecules';
import { InputDirective } from '../../../atoms';
import { DialogAction, DialogResult } from '../../../molecules';
import { ModalWrapperComponent } from '../../../molecules';

@Component({
  selector: 'ui-team-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalWrapperComponent,
    FormFieldComponent,
    InputDirective,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-form.component.html',
})
export class TeamFormComponent implements OnInit {
  team = input<TeamDto | null>(null);
  showDangerZone = input<boolean>(false);

  cancelForm = output<void>();
  submitForm = output<{ name: string; description: string }>();
  deleteTeam = output<void>();

  isEdit = false;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
  });

  dialogRef = inject<DialogRef<DialogResult>>(DialogRef, { optional: true });
  data: { team: TeamDto | null; showDangerZone?: boolean } | null = inject(DIALOG_DATA, {
    optional: true,
  });

  constructor() {
    effect(() => {
      this.initTeamData(this.team());
    });
  }

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
      this.submitForm.emit(value);
      if (this.dialogRef) {
        this.dialogRef.close({ action: DialogAction.SUBMIT, data: value });
      }
    }
  }
}
