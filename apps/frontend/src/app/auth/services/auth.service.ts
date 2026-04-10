import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthRefreshResponse,
  CompleteSetupRequest,
  LoginRequest,
  LoginResponse,
  PendingLoginResponse,
  UserDto,
} from '@LucidRF/common';
import { Observable } from 'rxjs';
import { ApiEndpoint } from '../../core/http/api-endpoints.enum';
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
    return this.http.post<LoginResponse | PendingLoginResponse>(`${this.baseUrl}${ApiEndpoint.AUTH_LOGIN}`, dto);
  }

  completeSetup(dto: CompleteSetupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}${ApiEndpoint.AUTH_COMPLETE_SETUP}`, dto);
  }

  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}${ApiEndpoint.USERS_ME}`);
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
