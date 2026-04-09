import { FileDto, FolderDto } from '@LucidRF/common';
import { FeatureState } from '../../core/store/feature-state.interface';
import { FilesErrorSource } from '../dto/files-error-source.enum';

export const FILES_FEATURE_KEY = 'files';

export interface FilesState extends FeatureState<FilesErrorSource> {
  files: FileDto[];
  folders: FolderDto[];
  ancestors: FolderDto[];
  currentFolder: FolderDto | null;
}

export const initialFilesState: FilesState = {
  files: [],
  folders: [],
  ancestors: [],
  currentFolder: null,
  loading: false,
  loaded: false,
  error: null,
};
