import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SystemRole } from '@LucidRF/common';
import {
  AdminSidebarComponent,
  AlertComponent,
  ButtonComponent,
  DashboardLayoutComponent,
  FormFieldComponent,
  InputDirective,
  PageActionBarComponent,
  SelectDirective,
  SpinnerComponent,
  TopHeaderComponent,
} from '@LucidRF/ui';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../auth/store/auth.facade';
import { NavigationService } from '../../../core/navigation/navigation.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputDirective,
    SelectDirective,
    ButtonComponent,
    AlertComponent,
    SpinnerComponent,
    PageActionBarComponent,
    DashboardLayoutComponent,
    TopHeaderComponent,
    AdminSidebarComponent,
  ],
  templateUrl: './admin-users.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class AdminUsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private navigationService = inject(NavigationService);

  roles = [
    { label: 'Standard User', value: SystemRole.USER },
    { label: 'Administrator', value: SystemRole.ADMIN },
  ];

  adminCreateForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$ = this.authFacade.user$;

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

  get activeTab(): 'users' | 'settings' {
    return this.navigationService.isActiveAdminTab('settings') ? 'settings' : 'users';
  }

  onTabClick(tab: 'users' | 'settings') {
    if (tab === 'users') {
      this.navigationService.toAdminUsers();
    } else {
      this.navigationService.toAdminSettings();
    }
  }

  onLogout() {
    this.authFacade.logout();
  }

  onSubmit(): void {
    if (this.adminCreateForm.invalid) {
      return;
    }

    this.authFacade.adminCreateUser(this.adminCreateForm.value);
  }
}
