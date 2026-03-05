import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class MyWorkspaceComponent implements OnInit, OnDestroy {
  private navigationService = inject(NavigationService);
  private filesFacade = inject(FilesFacade);
  private authFacade = inject(AuthFacade);

  files$ = this.filesFacade.files$;
  folders$ = this.filesFacade.folders$;
  user$ = this.authFacade.user$;

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'workspace-root', label: 'My Workspace' },
    ];
  }

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === 'home') {
      this.goHome();
    } else if (item.id === 'workspace-root') {
      // Navigate to workspace root if implemented
    }
  }

  ngOnInit() {
    this.authFacade.user$.subscribe((user) => {
      if (user?.id) {
        // Assume workspace ID is the user ID or use a specific load action
        this.filesFacade.loadContent(user.id);
      }
    });
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
