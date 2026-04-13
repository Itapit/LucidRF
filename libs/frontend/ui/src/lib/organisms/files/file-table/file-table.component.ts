import { ConnectedPosition } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FileDto, FolderDto } from '@LucidRF/common';

import { DropdownComponent } from '../../../molecules/dropdown/dropdown.component';
import { UnifiedResource } from './unified-resource.type';

/** Right-align menu to the kebab trigger; flip above the row when there is no room below. */
const FILE_ACTIONS_MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
];

@Component({
  selector: 'ui-file-table',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-table.component.html',
})
export class FileTableComponent {
  @ViewChildren(DropdownComponent) private actionMenus!: QueryList<DropdownComponent>;

  files = input<FileDto[] | null>([]);
  folders = input<FolderDto[] | null>([]);

  readonly fileActionsMenuPositions = FILE_ACTIONS_MENU_POSITIONS;

  fileClick = output<FileDto>();
  folderClick = output<FolderDto>();
  download = output<FileDto>();
  delete = output<FileDto>();
  deleteFolder = output<FolderDto>();

  unifiedResources = computed<UnifiedResource[]>(() => {
    const mappedFolders = (this.folders() || []).map((folder) => ({ ...folder, isFolder: true } as const));
    const mappedFiles = (this.files() || []).map((file) => ({ ...file, isFolder: false } as const));

    // Sort folders recursively before files, maybe just a simple sort is enough for now,
    // or assume they arrive pre-sorted from the store. We'll show all folders, then all files.
    return [...mappedFolders, ...mappedFiles];
  });

  /** Close the CDK overlay after an action; each file row has its own dropdown instance. */
  closeActionMenus() {
    this.actionMenus?.forEach((m) => m.close());
  }

  onDeleteRow(item: UnifiedResource) {
    this.closeActionMenus();
    if (item.isFolder) {
      this.deleteFolder.emit(item);
    } else {
      this.delete.emit(item);
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getStatusClasses(status: string) {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getDotClasses(status: string) {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500';
      case 'PROCESSING':
        return 'bg-blue-500 animate-pulse';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  }
}
