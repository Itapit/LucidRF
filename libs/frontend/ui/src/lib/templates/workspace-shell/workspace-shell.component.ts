import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileDto, FolderDto, TeamColor } from '@LucidRF/common';
import { BreadcrumbItem, BreadcrumbsComponent } from '../../molecules';
import { FileTableComponent, FolderSidebarComponent, PageActionBarComponent } from '../../organisms';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'ui-workspace-shell',
  standalone: true,
  imports: [
    CommonModule,
    FolderSidebarComponent,
    PageActionBarComponent,
    FileTableComponent,
    BreadcrumbsComponent,
    DashboardLayoutComponent,
  ],
  templateUrl: './workspace-shell.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class WorkspaceShellComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) initials!: string;
  @Input() subtitle = '';
  @Input() themeColor: string = TeamColor.SIGNAL_BLUE;
  @Input({ required: true }) breadcrumbs: BreadcrumbItem[] = [];
  @Input({ required: true }) files: FileDto[] = [];
  @Input({ required: true }) folders: FolderDto[] = [];

  @Output() folderClick = new EventEmitter<void>();
  @Output() newFolder = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<File>();
  @Output() breadcrumbClick = new EventEmitter<BreadcrumbItem>();
}
