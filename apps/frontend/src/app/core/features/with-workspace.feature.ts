import { Dialog } from '@angular/cdk/dialog';
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FileDto, FolderDto } from '@LucidRF/common';
import { DialogAction, DialogResult, FolderFormComponent } from '@LucidRF/ui';
import { signalStoreFeature, withComputed, withMethods } from '@ngrx/signals';
import { NavigationService } from '../../core/navigation/navigation.service';
import { FilesFacade } from '../../files/store/files.facade';

export function withWorkspace() {
  return signalStoreFeature(
    withComputed(() => {
      const filesFacade = inject(FilesFacade);

      const files = toSignal(filesFacade.files$, { initialValue: [] });
      const folders = toSignal(filesFacade.folders$, { initialValue: [] });
      const ancestors = toSignal(filesFacade.ancestors$, { initialValue: [] });
      const currentFolder = toSignal(filesFacade.currentFolder$, { initialValue: null });

      return { files, folders, ancestors, currentFolder };
    }),
    withMethods((store) => {
      const filesFacade = inject(FilesFacade);
      const navigationService = inject(NavigationService);
      const dialog = inject(Dialog);

      return {
        loadWorkspaceContent: (ownerId: string, folderId?: string) => {
          filesFacade.loadContent(ownerId, folderId);
        },
        pollWorkspaceContent: (ownerId: string, folderId?: string) => {
          filesFacade.pollContent(ownerId, folderId);
        },
        clearWorkspaceContent: () => {
          filesFacade.clearContent();
        },
        goHome: () => {
          navigationService.toHome();
        },
        onFolderClick: (teamId: string, folderId: string | null) => {
          filesFacade.loadContent(teamId, folderId || undefined);
        },
        onNewFolder: (teamId: string) => {
          const dialogRef = dialog.open<DialogResult<{ name: string }>>(FolderFormComponent);

          dialogRef.closed.subscribe((result: DialogResult<{ name: string }> | undefined) => {
            if (result?.action === DialogAction.SUBMIT && result.data) {
              const parentFolderId = store.currentFolder()?.resourceId;
              filesFacade.createFolder({
                name: result.data.name,
                teamId,
                parentFolderId,
              });
            }
          });
        },
        onUploadFile: (teamId: string, file: File) => {
          const parentFolderId = store.currentFolder()?.resourceId;
          filesFacade.uploadFile(
            {
              originalFileName: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
              teamId,
              parentFolderId,
            },
            file
          );
        },
        onDownloadFile: (file: FileDto) => {
          filesFacade.getDownloadUrl(file.resourceId, file.originalFileName);
        },
        onDeleteFile: (file: FileDto) => {
          filesFacade.deleteFile(file.resourceId);
        },
        onDeleteFolder: (folder: FolderDto) => {
          filesFacade.deleteFolder(folder.resourceId);
        },
      };
    })
  );
}
