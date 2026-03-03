import { createSelector } from '@ngrx/store';
import { filesFeature } from './files.reducer';

const { selectFilesState, selectFiles, selectFolders, selectLoading, selectLoaded, selectError } = filesFeature;

export {
  selectFiles,
  selectError as selectFilesError,
  selectLoaded as selectFilesLoaded,
  selectLoading as selectFilesLoading,
  selectFolders,
};

export const selectFileById = (fileId: string) =>
  createSelector(selectFiles, (files) => files.find((f) => f.resourceId === fileId) || null);

export const selectFolderById = (folderId: string) =>
  createSelector(selectFolders, (folders) => folders.find((f) => f.resourceId === folderId) || null);
