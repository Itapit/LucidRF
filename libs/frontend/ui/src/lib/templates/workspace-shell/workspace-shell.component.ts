
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FileDto, FolderDto, TeamColor } from '@LucidRF/common';
import { ButtonComponent } from '../../atoms';
import { BreadcrumbItem, BreadcrumbsComponent } from '../../molecules';
import { FileTableComponent, WorkspaceHeaderComponent } from '../../organisms';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'ui-workspace-shell',
  standalone: true,
  imports: [
    WorkspaceHeaderComponent,
    FileTableComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    DashboardLayoutComponent
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

  @Output() folderClick = new EventEmitter<string | null>();
  @Output() newFolder = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<File>();
  @Output() downloadFile = new EventEmitter<FileDto>();
  @Output() deleteFile = new EventEmitter<FileDto>();
  @Output() breadcrumbClick = new EventEmitter<BreadcrumbItem>();

  @Input() showNewFolder = true;
  @Input() showUpload = true;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onUploadClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile.emit(input.files[0]);
      // Reset the input so the same file can be selected again
      input.value = '';
    }
  }
}
