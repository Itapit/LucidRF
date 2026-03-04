import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FileDto } from '@LucidRF/common';

@Component({
  selector: 'ui-file-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-table.component.html',
})
export class FileTableComponent {
  files = input<FileDto[] | null>([]);

  fileClick = output<FileDto>();
  download = output<FileDto>();
  delete = output<FileDto>();

  activeMenuId: string | null = null;

  toggleMenu(event: Event, id: string) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeMenu() {
    this.activeMenuId = null;
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
