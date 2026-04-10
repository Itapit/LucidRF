import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, of, tap } from 'rxjs';
import { FilesErrorSource } from '../dto/files-error-source.enum';
import { FilesService } from '../services/files.service';
import { FilesActions } from './files.actions';

@Injectable()
export class FilesEffects {
  private actions$ = inject(Actions);
  private filesService = inject(FilesService);

  loadContent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.loadContent),
      concatMap(({ teamId, folderId }) =>
        this.filesService.loadContent(teamId, folderId).pipe(
          map((response) => FilesActions.loadContentSuccess({ response })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.loadContentFailure({
                error: {
                  source: FilesErrorSource.LOAD_CONTENT,
                  message: error.error?.message || 'Failed to load content',
                },
              })
            )
          )
        )
      )
    )
  );

  createFolder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.createFolder),
      concatMap(({ request }) =>
        this.filesService.createFolder(request).pipe(
          map((folder) => FilesActions.createFolderSuccess({ folder })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.createFolderFailure({
                error: {
                  source: FilesErrorSource.CREATE_FOLDER,
                  message: error.error?.message || 'Failed to create folder',
                },
              })
            )
          )
        )
      )
    )
  );

  deleteFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.deleteFile),
      concatMap(({ fileId }) =>
        this.filesService.deleteFile(fileId).pipe(
          map(() => FilesActions.deleteFileSuccess({ fileId })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.deleteFileFailure({
                error: {
                  source: FilesErrorSource.DELETE_RESOURCE,
                  message: error.error?.message || 'Failed to delete file',
                },
              })
            )
          )
        )
      )
    )
  );

  deleteFolder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.deleteFolder),
      concatMap(({ folderId }) =>
        this.filesService.deleteFolder(folderId).pipe(
          map(() => FilesActions.deleteFolderSuccess({ folderId })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.deleteFolderFailure({
                error: {
                  source: FilesErrorSource.DELETE_RESOURCE,
                  message: error.error?.message || 'Failed to delete folder',
                },
              })
            )
          )
        )
      )
    )
  );

  getDownloadUrl$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.getDownloadUrl),
      concatMap(({ fileId, originalFileName }) =>
        this.filesService.getDownloadUrl(fileId).pipe(
          map((response) =>
            FilesActions.getDownloadUrlSuccess({ url: response.url, originalFileName })
          ),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.getDownloadUrlFailure({
                error: {
                  source: FilesErrorSource.GET_DOWNLOAD_URL,
                  message: error.error?.message || 'Failed to get download URL',
                },
              })
            )
          )
        )
      )
    )
  );

  /** Applies the presigned URL: prefer blob download with filename; fall back to navigation. */
  completeDownload$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FilesActions.getDownloadUrlSuccess),
        tap(({ url, originalFileName }) => {
          const safeName = originalFileName?.trim() || 'download';
          fetch(url, { mode: 'cors', credentials: 'omit' })
            .then((res) => {
              if (!res.ok) throw new Error('Download failed');
              return res.blob();
            })
            .then((blob) => {
              const objectUrl = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = objectUrl;
              anchor.download = safeName;
              anchor.rel = 'noopener';
              anchor.click();
              URL.revokeObjectURL(objectUrl);
            })
            .catch(() => {
              window.location.assign(url);
            });
        })
      ),
    { dispatch: false }
  );

  // UPLOAD FLOW
  uploadFileInit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.uploadFile),
      concatMap(({ request, file }) =>
        this.filesService.initUpload(request).pipe(
          map((response) => FilesActions.uploadInitSuccess({ response, file })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.uploadInitFailure({
                error: {
                  source: FilesErrorSource.UPLOAD_FLOW,
                  message: error.error?.message || 'Failed to initialize upload',
                },
              })
            )
          )
        )
      )
    )
  );

  uploadToStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.uploadInitSuccess),
      concatMap(({ response, file }) =>
        this.filesService.uploadToStorage(response.uploadUrl, file).pipe(
          map(() => FilesActions.uploadToStorageSuccess({ fileId: response.file.resourceId })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.uploadToStorageFailure({
                fileId: response.file.resourceId,
                error: {
                  source: FilesErrorSource.UPLOAD_FLOW,
                  message: error.error?.message || 'Failed to upload to storage',
                },
              })
            )
          )
        )
      )
    )
  );

  confirmUploadSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilesActions.uploadToStorageSuccess),
      concatMap(({ fileId }) =>
        this.filesService.confirmUpload({ fileId, success: true }).pipe(
          map((response) => FilesActions.confirmUploadSuccess({ response })),
          catchError((error: HttpErrorResponse) =>
            of(
              FilesActions.confirmUploadFailure({
                error: {
                  source: FilesErrorSource.UPLOAD_FLOW,
                  message: error.error?.message || 'Failed to confirm upload',
                },
              })
            )
          )
        )
      )
    )
  );

  confirmUploadFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FilesActions.uploadToStorageFailure),
        concatMap(({ fileId }) =>
          this.filesService.confirmUpload({ fileId, success: false }).pipe(catchError(() => of({ type: 'NO_OP' })))
        )
      ),
    { dispatch: false }
  );
}
