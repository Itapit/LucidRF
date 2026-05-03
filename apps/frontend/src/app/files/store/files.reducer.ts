import { FileDto } from '@LucidRF/common';
import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from '../../auth/store/auth.actions';
import { FilesActions } from './files.actions';
import { FILES_FEATURE_KEY, initialFilesState } from './files.state';

export const filesReducer = createReducer(
  initialFilesState,

  // --- GLOBAL ---
  on(AuthActions.logoutSuccess, FilesActions.clearContent, () => initialFilesState),

  // --- LOAD CONTENT ---
  on(FilesActions.loadContent, (state) => ({
    ...state,
    loading: true,
    error: null,
    files: [],
    folders: [],
    ancestors: [],
    currentFolder: null,
  })),
  on(FilesActions.loadContentSuccess, (state, { response }) => ({
    ...state,
    files: response.files,
    folders: response.folders,
    ancestors: response.ancestors || [],
    currentFolder: response.currentFolder || null,
    loaded: true,
    loading: false,
  })),
  on(FilesActions.loadContentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- POLL CONTENT ---
  on(FilesActions.pollContent, (state) => ({
    ...state,
    // Do not set loading to true, do not clear files/folders
  })),
  on(FilesActions.pollContentSuccess, (state, { response }) => ({
    ...state,
    files: response.files,
    folders: response.folders,
    ancestors: response.ancestors || [],
    currentFolder: response.currentFolder || null,
  })),
  on(FilesActions.pollContentFailure, (state) => ({
    ...state,
    // Optionally ignore the error to avoid flashing errors on temporary network drops
  })),

  // --- CREATE FOLDER ---
  on(FilesActions.createFolder, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FilesActions.createFolderSuccess, (state, { folder }) => ({
    ...state,
    folders: [...state.folders, folder],
    loading: false,
  })),
  on(FilesActions.createFolderFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- DELETE RESOURCE ---
  on(FilesActions.deleteFile, FilesActions.deleteFolder, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FilesActions.deleteFileSuccess, (state, { fileId }) => ({
    ...state,
    files: state.files.filter((f) => f.resourceId !== fileId),
    loading: false,
  })),
  on(FilesActions.deleteFolderSuccess, (state, { folderId }) => ({
    ...state,
    folders: state.folders.filter((f) => f.resourceId !== folderId),
    loading: false,
  })),
  on(FilesActions.deleteFileFailure, FilesActions.deleteFolderFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- DOWNLOAD ---
  on(FilesActions.getDownloadUrl, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FilesActions.getDownloadUrlSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(FilesActions.getDownloadUrlFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- UPLOAD FLOW ---
  on(FilesActions.uploadFile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FilesActions.uploadInitSuccess, (state, { response }) => ({
    ...state,
    files: [...state.files, response.file],
    loading: true,
  })),
  on(FilesActions.uploadToStorageSuccess, (state) => ({
    ...state,
    loading: true,
  })),
  on(FilesActions.confirmUploadSuccess, (state, { response }) => ({
    ...state,
    files: response.file
      ? state.files.map((f) => (f.resourceId === response.file?.resourceId ? (response.file as FileDto) : f))
      : state.files,
    loading: false,
  })),
  on(
    FilesActions.uploadInitFailure,
    FilesActions.uploadToStorageFailure,
    FilesActions.confirmUploadFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  )
);

export const filesFeature = createFeature({
  name: FILES_FEATURE_KEY,
  reducer: filesReducer,
});
