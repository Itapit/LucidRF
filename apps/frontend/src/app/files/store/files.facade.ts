import { inject, Injectable } from '@angular/core';
import { CreateFolderRequest, InitUploadRequest } from '@LucidRF/common';
import { Store } from '@ngrx/store';
import { FilesActions } from './files.actions';
import { selectFiles, selectFilesError, selectFilesLoaded, selectFilesLoading, selectFolders } from './files.selectors';
import { FilesState } from './files.state';

@Injectable({ providedIn: 'root' })
export class FilesFacade {
  private readonly store = inject<Store<{ files: FilesState }>>(Store);

  // --- State Observables ---
  loading$ = this.store.select(selectFilesLoading);
  loaded$ = this.store.select(selectFilesLoaded);
  error$ = this.store.select(selectFilesError);

  files$ = this.store.select(selectFiles);
  folders$ = this.store.select(selectFolders);

  // --- Action Dispatchers ---
  loadContent(teamId: string, folderId?: string) {
    this.store.dispatch(FilesActions.loadContent({ teamId, folderId }));
  }

  createFolder(request: CreateFolderRequest) {
    this.store.dispatch(FilesActions.createFolder({ request }));
  }

  deleteFile(fileId: string) {
    this.store.dispatch(FilesActions.deleteFile({ fileId }));
  }

  deleteFolder(folderId: string) {
    this.store.dispatch(FilesActions.deleteFolder({ folderId }));
  }

  getDownloadUrl(fileId: string) {
    this.store.dispatch(FilesActions.getDownloadUrl({ fileId }));
  }

  uploadFile(request: InitUploadRequest, file: File) {
    this.store.dispatch(FilesActions.uploadFile({ request, file }));
  }
}
