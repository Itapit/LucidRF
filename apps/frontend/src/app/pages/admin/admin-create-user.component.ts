import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SystemRole } from '@LucidRF/common';
import { AlertComponent, ButtonComponent, FormFieldComponent, InputDirective, SelectDirective } from '@LucidRF/ui';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../auth/store/auth.facade';

@Component({
  selector: 'app-admin-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputDirective,
    SelectDirective,
    ButtonComponent,
    AlertComponent,
  ],
  templateUrl: './admin-create-user.component.html',
})
export class AdminCreateUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  roles = [
    { label: 'Standard User', value: SystemRole.USER },
    { label: 'Administrator', value: SystemRole.ADMIN },
  ];

  adminCreateForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor() {
    this.isLoading$ = this.authFacade.loading$;
    this.error$ = this.authFacade.adminCreateUserError$;
  }

  ngOnInit(): void {
    this.adminCreateForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      role: [SystemRole.USER, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.adminCreateForm.invalid) {
      return;
    }

    this.authFacade.adminCreateUser(this.adminCreateForm.value);
  }
}
