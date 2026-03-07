import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserRequest, SystemRole } from '@LucidRF/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputDirective } from '../../atoms/input/input.directive';
import { SelectDirective } from '../../atoms/select/select.directive';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { FormFieldComponent } from '../../molecules/form-field/form-field.component';
import { ModalWrapperComponent } from '../../molecules/modal-wrapper/modal-wrapper.component';

@Component({
  selector: 'ui-user-create-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputDirective,
    SelectDirective,
    ButtonComponent,
    AlertComponent,
    ModalWrapperComponent,
  ],
  standalone: true,
  templateUrl: './user-create-modal.component.html',
})
export class UserCreateModalComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() error: string | null = null;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() submitUser = new EventEmitter<CreateUserRequest>();

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
    this.adminCreateForm.reset({ role: SystemRole.USER });
    this.closeDrawer.emit();
  }

  onSubmit() {
    if (this.adminCreateForm.invalid) return;
    this.submitUser.emit(this.adminCreateForm.value);
  }
}
