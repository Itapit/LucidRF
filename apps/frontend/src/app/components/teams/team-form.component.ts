import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
export class TeamFormComponent {
  @Input() set team(val: TeamDto | null) {
    if (val) {
      this.isEdit = true;
      this.form.patchValue({ name: val.name, description: val.description || '' });
    } else {
      this.isEdit = false;
      this.form.reset();
    }
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

  onSubmit() {
    if (this.form.valid) {
      this.submitForm.emit(this.form.getRawValue());
    }
  }
}
