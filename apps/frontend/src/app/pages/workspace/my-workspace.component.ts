
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { FileDto, FolderDto, TeamColor } from '@LucidRF/common';
import { BreadcrumbItem, WorkspaceShellComponent, MlAnalysisModalComponent, MlAnalysisModalData } from '@LucidRF/ui';
import { MyWorkspaceStore } from './my-workspace.store';
import { FilesService } from '../../files/services/files.service';
import { firstValueFrom } from 'rxjs';

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

  defaultColor = TeamColor.SIGNAL_BLUE;

  get breadcrumbs(): BreadcrumbItem[] {
    const baseBreadcrumbs: BreadcrumbItem[] = [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'workspace-root', label: 'My Workspace' },
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
  }

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === 'home') {
      this.store.goHome();
    } else if (item.id === 'workspace-root') {
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
    
    // Find the associated system files
    const cleanFile = allFiles.find(f => f.uploadedBy === 'SYSTEM' && f.originalFileName === `Clean_${file.originalFileName}`);
    const spectrogramFile = allFiles.find(f => f.uploadedBy === 'SYSTEM' && f.originalFileName === `${file.originalFileName}_Spectrogram.png`);

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
        }
      }
    });
  }
}
