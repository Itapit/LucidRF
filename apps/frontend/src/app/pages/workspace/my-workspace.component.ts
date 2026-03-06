import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BreadcrumbItem,
  BreadcrumbsComponent,
  DashboardLayoutComponent,
  FileTableComponent,
  FolderSidebarComponent,
  PageActionBarComponent,
} from '@LucidRF/ui';
import { AuthFacade } from '../../auth/store/auth.facade';
import { NavigationService } from '../../core/navigation/navigation.service';
import { FilesFacade } from '../../files/store/files.facade';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FolderSidebarComponent,
    PageActionBarComponent,
    FileTableComponent,
    BreadcrumbsComponent,
    DashboardLayoutComponent,
  ],
  templateUrl: './my-workspace.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class MyWorkspaceComponent implements OnDestroy {
  private navigationService = inject(NavigationService);
  private filesFacade = inject(FilesFacade);
  private authFacade = inject(AuthFacade);

  files = toSignal(this.filesFacade.files$, { initialValue: [] });
  folders = toSignal(this.filesFacade.folders$, { initialValue: [] });
  user = toSignal(this.authFacade.user$, { initialValue: null });

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'workspace-root', label: 'My Workspace' },
    ];
  }

  constructor() {
    effect(() => {
      const u = this.user();
      if (u?.id) {
        this.filesFacade.loadContent(u.id);
      }
    });
  }

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === 'home') {
      this.goHome();
    } else if (item.id === 'workspace-root') {
      // Navigate to workspace root if implemented
    }
  }

  ngOnDestroy() {
    this.filesFacade.clearContent();
  }

  goHome() {
    this.navigationService.toHome();
  }

  onFolderClick() {
    // Handle folder navigation
  }

  onNewFolder() {
    // Open new folder modal
  }

  onUploadFile() {
    // Open upload flow
  }
}
