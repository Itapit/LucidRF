import { DialogRef } from '@angular/cdk/dialog';

import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputDirective } from '../../../atoms';
import { DialogAction, DialogResult, FormFieldComponent, ModalWrapperComponent } from '../../../molecules';

@Component({
  selector: 'ui-folder-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalWrapperComponent, FormFieldComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folder-form.component.html',
})
export class FolderFormComponent {
  cancelForm = output<void>();
  submitForm = output<{ name: string }>();

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  dialogRef = inject<DialogRef<DialogResult>>(DialogRef, { optional: true });

  onCancel() {
    this.cancelForm.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
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
