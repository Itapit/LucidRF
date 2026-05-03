import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { FileDto, FileStatus, FolderDto, isSdrFile, TeamColor } from '@LucidRF/common';
import {
  BreadcrumbItem,
  MlAnalysisModalComponent,
  MlAnalysisModalData,
  ToastService,
  WorkspaceNavigationId,
  WorkspaceShellComponent,
} from '@LucidRF/ui';
import { firstValueFrom } from 'rxjs';
import { FilesService } from '../../files/services/files.service';
import { MyWorkspaceStore } from './my-workspace.store';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [WorkspaceShellComponent, DialogModule],
  templateUrl: './my-workspace.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
  providers: [MyWorkspaceStore],
})
export class MyWorkspaceComponent implements OnDestroy {
  readonly store = inject(MyWorkspaceStore);
  private dialog = inject(Dialog);
  private filesService = inject(FilesService);
  private toastService = inject(ToastService);

  private readonly previousFileStatuses = new Map<string, FileStatus | string>();
  private readonly openedAnalysisFileIds = new Set<string>();

  defaultColor = TeamColor.SIGNAL_BLUE;

  get breadcrumbs(): BreadcrumbItem[] {
    const baseBreadcrumbs: BreadcrumbItem[] = [
      { id: WorkspaceNavigationId.Home, label: 'Home', icon: 'home' },
      { id: WorkspaceNavigationId.WorkspaceRoot, label: 'My Workspace' },
    ];

    const ancestors = this.store.ancestors?.() || [];
    const currentFolder = this.store.currentFolder?.();

    const ancestorBreadcrumbs = ancestors.map((folder: FolderDto) => ({
      id: folder.resourceId,
      label: folder.name,
    }));

    if (currentFolder) {
      ancestorBreadcrumbs.push({ id: currentFolder.resourceId, label: currentFolder.name });
    }

    return [...baseBreadcrumbs, ...ancestorBreadcrumbs];
  }

  constructor() {
    effect(() => {
      this.store.initWorkspace();
    });

    effect(() => {
      const files = this.store.files() || [];
      const availableNow: FileDto[] = [];
      const activeFileIds = new Set<string>();

      for (const file of files) {
        if (file.uploadedBy === 'SYSTEM') {
          continue;
        }

        activeFileIds.add(file.resourceId);
        const previousStatus = this.previousFileStatuses.get(file.resourceId);

        if (
          (previousStatus === FileStatus.PROCESSING ||
            previousStatus === FileStatus.UPLOADED ||
            previousStatus === FileStatus.PENDING) &&
          file.status === FileStatus.AVAILABLE &&
          !this.openedAnalysisFileIds.has(file.resourceId)
        ) {
          availableNow.push(file);
          this.openedAnalysisFileIds.add(file.resourceId);
          this.toastService.success('ML analysis ready', `${file.originalFileName} has finished processing.`);
        }

        this.previousFileStatuses.set(file.resourceId, file.status);
      }

      for (const trackedFileId of this.previousFileStatuses.keys()) {
        if (!activeFileIds.has(trackedFileId)) {
          this.previousFileStatuses.delete(trackedFileId);
        }
      }

      const analysisCandidate = availableNow.find((file) => isSdrFile(file.originalFileName));
      if (analysisCandidate && this.dialog.openDialogs.length === 0) {
        this.onViewAnalysis(analysisCandidate);
      }
    });
  }

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === WorkspaceNavigationId.Home) {
      this.store.goHome();
    } else if (item.id === WorkspaceNavigationId.WorkspaceRoot) {
      const teamId = this.store.team()?.id;
      if (teamId) {
        this.store.loadWorkspaceContent(teamId, undefined);
      }
    } else {
      const teamId = this.store.team()?.id;
      if (teamId) {
        this.store.loadWorkspaceContent(teamId, item.id);
      }
    }
  }

  ngOnDestroy() {
    this.store.clearWorkspaceContent();
  }

  onViewAnalysis(file: FileDto) {
    const allFiles = this.store.files() || [];

    // Find the associated system files using their database IDs stored in metadata
    const cleanFile = allFiles.find((f) => f.resourceId === file.metadata?.['clean_file_id']);
    const spectrogramFile = allFiles.find((f) => f.resourceId === file.metadata?.['spectrogram_file_id']);

    this.dialog.open<void, MlAnalysisModalData>(MlAnalysisModalComponent, {
      width: '900px',
      data: {
        originalFile: file,
        cleanFile,
        spectrogramFile,
        getDownloadUrl: async (fileId: string) => {
          const res = await firstValueFrom(this.filesService.getDownloadUrl(fileId));
          return res.url;
        },
        onDownloadFile: (f: FileDto) => {
          this.store.onDownloadFile(f);
        },
      },
    });
  }
}
