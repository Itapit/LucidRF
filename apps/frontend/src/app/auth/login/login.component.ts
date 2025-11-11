import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthFacade } from '../store/auth.facade';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  loginForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor() {
    this.isLoading$ = this.authFacade.loading$;
    this.error$ = this.authFacade.loginError$;
  }

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

    // Dispatch the login action using the form's value
    this.authFacade.login(this.loginForm.value);
  }
}
