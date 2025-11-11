import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRole } from '@limbo/common';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../auth/store/auth.facade';

@Component({
  selector: 'app-admin-create-user',
  standalone: false,
  templateUrl: './admin-create-user.component.html',
  styleUrls: ['./admin-create-user.component.css'],
})
export class AdminCreateUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  roles = [
    { label: 'Standard User', value: UserRole.USER },
    { label: 'Administrator', value: UserRole.ADMIN },
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
      role: [UserRole.USER, [Validators.required]], // Default to '
    });
  }

  onSubmit(): void {
    if (this.adminCreateForm.invalid) {
      return;
    }

    this.authFacade.adminCreateUser(this.adminCreateForm.value);
  }
}
