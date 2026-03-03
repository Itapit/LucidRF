import {
  ConfirmUploadResponse,
  CreateFolderRequest,
  FolderDto,
  InitUploadRequest,
  InitUploadResponse,
  ListContentResponse,
} from '@LucidRF/common';
import { createActionGroup, props } from '@ngrx/store';
import { ActionError } from '../../core/store/action-error.interface';
import { FilesErrorSource } from '../dto/files-error-source.enum';

export const FilesActions = createActionGroup({
  source: 'Files',
  events: {
    // --- LOAD CONTENT ---
    'Load Content': props<{ teamId: string; folderId?: string }>(),
    'Load Content Success': props<{ response: ListContentResponse }>(),
    'Load Content Failure': props<{ error: ActionError<FilesErrorSource> }>(),

    // --- CREATE FOLDER ---
    'Create Folder': props<{ request: CreateFolderRequest }>(),
    'Create Folder Success': props<{ folder: FolderDto }>(),
    'Create Folder Failure': props<{ error: ActionError<FilesErrorSource> }>(),

    // --- DELETE RESOURCE ---
    'Delete File': props<{ fileId: string }>(),
    'Delete File Success': props<{ fileId: string }>(),
    'Delete File Failure': props<{ error: ActionError<FilesErrorSource> }>(),

    'Delete Folder': props<{ folderId: string }>(),
    'Delete Folder Success': props<{ folderId: string }>(),
    'Delete Folder Failure': props<{ error: ActionError<FilesErrorSource> }>(),

    // --- DOWNLOAD ---
    'Get Download Url': props<{ fileId: string }>(),
    'Get Download Url Success': props<{ url: string }>(),
    'Get Download Url Failure': props<{ error: ActionError<FilesErrorSource> }>(),

    // --- UPLOAD FLOW ---
    'Upload File': props<{ request: InitUploadRequest; file: File }>(),
    'Upload Init Success': props<{ response: InitUploadResponse; file: File }>(),
    'Upload Init Failure': props<{ error: ActionError<FilesErrorSource> }>(),

    'Upload To Storage Success': props<{ fileId: string }>(),
    'Upload To Storage Failure': props<{ fileId: string; error: ActionError<FilesErrorSource> }>(),

    'Confirm Upload Success': props<{ response: ConfirmUploadResponse }>(),
    'Confirm Upload Failure': props<{ error: ActionError<FilesErrorSource> }>(),
  },
});
