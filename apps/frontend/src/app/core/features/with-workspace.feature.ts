import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { signalStoreFeature, withComputed, withMethods } from '@ngrx/signals';
import { NavigationService } from '../../core/navigation/navigation.service';
import { FilesFacade } from '../../files/store/files.facade';

export function withWorkspace() {
  return signalStoreFeature(
    withComputed(() => {
      const filesFacade = inject(FilesFacade);

      const files = toSignal(filesFacade.files$, { initialValue: [] });
      const folders = toSignal(filesFacade.folders$, { initialValue: [] });

      return { files, folders };
    }),
    withMethods((store) => {
      const filesFacade = inject(FilesFacade);
      const navigationService = inject(NavigationService);

      return {
        loadWorkspaceContent: (ownerId: string) => {
          filesFacade.loadContent(ownerId);
        },
        clearWorkspaceContent: () => {
          filesFacade.clearContent();
        },
        goHome: () => {
          navigationService.toHome();
        },
        onFolderClick: () => {
          // Handle folder navigation
          console.log('Folder clicked');
        },
        onNewFolder: () => {
          // Open new folder modal
          console.log('New folder requested');
        },
        onUploadFile: (teamId: string, file: File, parentFolderId?: string) => {
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
      };
    })
  );
}
