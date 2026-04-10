import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  CreateFolderRequest,
  DeleteResourceResponse,
  FolderDto,
  GetDownloadUrlResponse,
  InitUploadRequest,
  InitUploadResponse,
  ListContentResponse,
} from '@LucidRF/common';
import { map, Observable } from 'rxjs';
import { ApiEndpoint } from '../../core/http/api-endpoints.enum';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly baseUrl = `${environment.BACKEND_BASE_URL}`;
  private http = inject(HttpClient);

  loadContent(teamId: string, folderId?: string): Observable<ListContentResponse> {
    let params = new HttpParams().set('teamId', teamId);
    if (folderId) {
      params = params.set('folderId', folderId);
    }
    return this.http.get<ListContentResponse>(`${this.baseUrl}${ApiEndpoint.FILES}/content`, { params });
  }

  createFolder(request: CreateFolderRequest): Observable<FolderDto> {
    return this.http.post<FolderDto>(`${this.baseUrl}${ApiEndpoint.FILES}/folder`, request);
  }

  deleteFile(fileId: string): Observable<DeleteResourceResponse> {
    return this.http.delete<DeleteResourceResponse>(`${this.baseUrl}${ApiEndpoint.FILES}/file/${fileId}`);
  }

  deleteFolder(folderId: string): Observable<DeleteResourceResponse> {
    return this.http.delete<DeleteResourceResponse>(`${this.baseUrl}${ApiEndpoint.FILES}/folder/${folderId}`);
  }

  getDownloadUrl(fileId: string): Observable<GetDownloadUrlResponse> {
    return this.http
      .get<string | GetDownloadUrlResponse>(`${this.baseUrl}${ApiEndpoint.FILES}/download/${fileId}`, {
        // Backend can return either raw URL text or { url } JSON depending on gateway shape.
        responseType: 'text' as 'json',
      })
      .pipe(
        map((response) => {
          if (typeof response === 'string') {
            return { url: response };
          }
          return response;
        })
      );
  }

  initUpload(request: InitUploadRequest): Observable<InitUploadResponse> {
    return this.http.post<InitUploadResponse>(`${this.baseUrl}${ApiEndpoint.FILES}/init-upload`, request);
  }

  uploadToStorage(uploadUrl: string, file: File): Observable<void> {
    // Note: HttpHeaders are handled by HttpClient correctly, but we need to ensure the CredentialsInterceptor
    // doesn't append cookies if it's not our backend url. We checked that earlier (it only intercepts backendUrl).
    return this.http.put<void>(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  confirmUpload(request: ConfirmUploadRequest): Observable<ConfirmUploadResponse> {
    return this.http.post<ConfirmUploadResponse>(`${this.baseUrl}${ApiEndpoint.FILES}/confirm-upload`, request);
  }
}
