import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AdminCreateUserRequest,
  AuthRefreshResponse,
  CompleteSetupRequest,
  LoginRequest,
  LoginResponse,
  PendingLoginResponse,
  UserDto,
} from '@limbo/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.BACKEND_BASE_URL}`;
  private http = inject(HttpClient);

  private httpBackend = inject(HttpBackend);
  private cleanHttp = new HttpClient(this.httpBackend);

  login(dto: LoginRequest): Observable<LoginResponse | PendingLoginResponse> {
    return this.http.post<LoginResponse | PendingLoginResponse>(`${this.baseUrl}/auth/login`, dto);
  }

  adminCreateUser(dto: AdminCreateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/users`, dto);
  }

  completeSetup(dto: CompleteSetupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/complete-setup`, dto);
  }

  //TODO: add this in the back
  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/users/me`);
  }

  /**
   * This call MUST use the 'cleanHttp' client to avoid
   * being re-intercepted by our own AuthInterceptor.
   */
  refresh(): Observable<AuthRefreshResponse> {
    return this.cleanHttp.post<AuthRefreshResponse>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }
}
