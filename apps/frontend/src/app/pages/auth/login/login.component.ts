
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  ButtonComponent,
  CenteredLayoutComponent,
  FormFieldComponent,
  InputDirective,
} from '@LucidRF/ui';
import { AuthFacade } from '../../../auth/store/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormFieldComponent,
    InputDirective,
    ButtonComponent,
    AlertComponent,
    CenteredLayoutComponent
],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  loginForm!: FormGroup;
  isLoading = toSignal(this.authFacade.loading$, { initialValue: false });
  error = toSignal(this.authFacade.loginError$, { initialValue: null });

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.authFacade.login(this.loginForm.value);
  }
}
