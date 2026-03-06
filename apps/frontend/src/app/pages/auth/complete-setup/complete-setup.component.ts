import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  ButtonComponent,
  CenteredLayoutComponent,
  FormFieldComponent,
  InputDirective,
  SpinnerComponent,
} from '@LucidRF/ui';
import { AuthFacade } from '../../../auth/store/auth.facade';

@Component({
  selector: 'app-complete-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputDirective,
    ButtonComponent,
    AlertComponent,
    SpinnerComponent,
    CenteredLayoutComponent,
  ],
  templateUrl: './complete-setup.component.html',
})
export class CompleteSetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  setupForm!: FormGroup;

  isLoading = toSignal(this.authFacade.loading$, { initialValue: false });
  error = toSignal(this.authFacade.completeSetupError$, { initialValue: null });

  ngOnInit(): void {
    this.setupForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get passwordError(): string | null {
    const control = this.setupForm.get('password');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) {
        return 'Password is required.';
      }
      if (control.errors?.['minlength']) {
        return 'Password must be at least 8 characters.';
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.authFacade.completeSetup(this.setupForm.value);
  }
}
