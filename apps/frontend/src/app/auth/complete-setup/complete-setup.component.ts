import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthFacade } from '../store/auth.facade';

@Component({
  selector: 'app-complete-setup',
  standalone: false,
  templateUrl: './complete-setup.component.html',
  styleUrl: './complete-setup.component.css',
})
export class CompleteSetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  setupForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor() {
    this.isLoading$ = this.authFacade.loading$;
    this.error$ = this.authFacade.completeSetupError$;
  }

  ngOnInit(): void {
    this.setupForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.setupForm.invalid) {
      return;
    }

    this.authFacade.completeSetup(this.setupForm.value);
  }
}
