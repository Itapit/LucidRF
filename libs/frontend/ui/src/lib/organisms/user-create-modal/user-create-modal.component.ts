import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { Component, OnInit, Signal, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserRequest, SystemRole } from '@LucidRF/common';
import { InputDirective } from '../../atoms/input/input.directive';
import { SelectDirective } from '../../atoms/select/select.directive';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { FormFieldComponent } from '../../molecules/form-field/form-field.component';
import { DialogAction, DialogResult } from '../../molecules/modal-wrapper/dialog.types';
import { ModalWrapperComponent } from '../../molecules/modal-wrapper/modal-wrapper.component';

export interface UserCreateModalData {
  isSubmitting?: Signal<boolean>;
  error?: Signal<string | null>;
  onSubmit?: (data: CreateUserRequest) => void;
}

@Component({
  selector: 'ui-user-create-modal',
  imports: [
    ReactiveFormsModule,
    FormFieldComponent,
    InputDirective,
    SelectDirective,
    AlertComponent,
    ModalWrapperComponent
],
  standalone: true,
  templateUrl: './user-create-modal.component.html',
})
export class UserCreateModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject<DialogRef<DialogResult<CreateUserRequest>>>(DialogRef, { optional: true });
  data = inject<UserCreateModalData>(DIALOG_DATA, { optional: true });

  isSubmitting = this.data?.isSubmitting || signal(false);
  error = this.data?.error || signal(null);

  roles = [
    { label: 'Standard User', value: SystemRole.USER },
    { label: 'Administrator', value: SystemRole.ADMIN },
  ];

  adminCreateForm!: FormGroup;

  ngOnInit(): void {
    this.adminCreateForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      role: [SystemRole.USER, [Validators.required]],
    });
  }

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.adminCreateForm.invalid) return;
    const value = this.adminCreateForm.value;

    if (this.data?.onSubmit) {
      this.data.onSubmit(value);
    } else {
      if (this.dialogRef) {
        this.dialogRef.close({ action: DialogAction.SUBMIT, data: value });
      }
    }
  }
}
