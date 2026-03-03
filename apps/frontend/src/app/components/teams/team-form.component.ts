import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamDto } from '@LucidRF/common';
import { ModalWrapperComponent } from '../../components/shared/modals/modal-wrapper.component';

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

  @Output() cancel = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<{ name: string; description: string }>();
  @Output() deleteTeam = new EventEmitter<void>();

  isEdit = false;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
  });

  dialogRef = inject<DialogRef<any>>(DialogRef as any, { optional: true });
  data: { team: TeamDto | null; showDangerZone?: boolean } = inject(DIALOG_DATA, {
    optional: true,
  }) as any;

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
    this.cancel.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onDeleteTeam() {
    this.deleteTeam.emit();
    if (this.dialogRef) {
      this.dialogRef.close({ action: 'delete' });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.submitForm.emit(value);
      if (this.dialogRef) {
        this.dialogRef.close({ action: 'submit', data: value });
      }
    }
  }
}
