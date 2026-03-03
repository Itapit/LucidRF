import { FileDto, FolderDto } from '@LucidRF/common';
import { FeatureState } from '../../core/store/feature-state.interface';
import { FilesErrorSource } from '../dto/files-error-source.enum';

export const FILES_FEATURE_KEY = 'files';

export interface FilesState extends FeatureState<FilesErrorSource> {
  files: FileDto[];
  folders: FolderDto[];
}

export const initialFilesState: FilesState = {
  files: [],
  folders: [],
  loading: false,
  loaded: false,
  error: null,
};
