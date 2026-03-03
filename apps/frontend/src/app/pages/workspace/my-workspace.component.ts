import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthFacade } from '../../auth/store/auth.facade';
import { FileTableComponent } from '../../components/files/file-table.component';
import { FolderSidebarComponent } from '../../components/files/folder-sidebar.component';
import { PageActionBarComponent } from '../../components/shared/layout/page-action-bar.component';
import { TopHeaderComponent } from '../../components/shared/layout/top-header.component';
import { NavigationService } from '../../core/navigation/navigation.service';
import { FilesFacade } from '../../files/store/files.facade';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [CommonModule, TopHeaderComponent, FolderSidebarComponent, PageActionBarComponent, FileTableComponent],
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

  onLogout() {
    this.authFacade.logout();
  }

  onFolderClick(folderId: string | null) {
    // Handle folder navigation
  }

  onNewFolder() {
    // Open new folder modal
  }

  onUploadFile() {
    // Open upload flow
  }
}
