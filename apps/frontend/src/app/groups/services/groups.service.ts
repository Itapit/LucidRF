import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateGroupRequest, GroupDto, UpdateGroupRequest } from '@limbo/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly baseUrl = `${environment.BACKEND_BASE_URL}`;
  private http = inject(HttpClient);

  loadGroups(): Observable<GroupDto[]> {
    return this.http.get<GroupDto[]>(`${this.baseUrl}/groups`);
  }

  createGroup(groupData: CreateGroupRequest): Observable<GroupDto> {
    return this.http.post<GroupDto>(`${this.baseUrl}/groups`, groupData);
  }

  updateGroup(groupId: string, groupData: UpdateGroupRequest): Observable<GroupDto> {
    return this.http.patch<GroupDto>(`${this.baseUrl}/groups/${groupId}`, groupData);
  }

  deleteGroup(groupId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/groups/${groupId}`);
  }

  addUserToGroup(groupId: string, userId: string): Observable<GroupDto> {
    return this.http.post<GroupDto>(`${this.baseUrl}/groups/${groupId}/members`, { targetUserId: userId });
  }

  removeUserFromGroup(groupId: string, userId: string): Observable<GroupDto> {
    return this.http.delete<GroupDto>(`${this.baseUrl}/groups/${groupId}/members/${userId}`);
  }
}
