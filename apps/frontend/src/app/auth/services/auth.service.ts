import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccessTokenInfo, LoginRequest, RegisterRequest } from '@limbo/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.BACKEND_BASE_URL}`;

  private http = inject(HttpClient);

  login(dto: LoginRequest): Observable<AccessTokenInfo> {
    return this.http.post<AccessTokenInfo>(`${this.baseUrl}/auth/login`, dto);
  }

  register(dto: RegisterRequest): Observable<AccessTokenInfo> {
    return this.http.post<AccessTokenInfo>(`${this.baseUrl}/auth/register`, dto);
  }

  refresh(): Observable<AccessTokenInfo> {
    return this.http.post<AccessTokenInfo>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true });
  }
  // TODO get profile /me
  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true });
  }
}
