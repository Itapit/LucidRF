import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateTeamRequest, TeamDto, UpdateTeamRequest } from '@LucidRF/common';
import { Observable } from 'rxjs';
import { ApiEndpoint } from '../../core/http/api-endpoints.enum';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly baseUrl = `${environment.BACKEND_BASE_URL}`;
  private http = inject(HttpClient);

  loadTeams(): Observable<TeamDto[]> {
    return this.http.get<TeamDto[]>(`${this.baseUrl}${ApiEndpoint.TEAMS}`);
  }

  createTeam(teamData: CreateTeamRequest): Observable<TeamDto> {
    return this.http.post<TeamDto>(`${this.baseUrl}${ApiEndpoint.TEAMS}`, teamData);
  }

  updateTeam(teamId: string, teamData: UpdateTeamRequest): Observable<TeamDto> {
    return this.http.patch<TeamDto>(`${this.baseUrl}${ApiEndpoint.TEAMS}/${teamId}`, teamData);
  }

  deleteTeam(teamId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}${ApiEndpoint.TEAMS}/${teamId}`);
  }

  addUserToTeam(teamId: string, userId: string): Observable<TeamDto> {
    return this.http.post<TeamDto>(`${this.baseUrl}${ApiEndpoint.TEAMS}/${teamId}/members`, {
      targetUserId: userId,
    });
  }

  removeUserFromTeam(teamId: string, userId: string): Observable<TeamDto> {
    return this.http.delete<TeamDto>(`${this.baseUrl}${ApiEndpoint.TEAMS}/${teamId}/members/${userId}`);
  }
}
