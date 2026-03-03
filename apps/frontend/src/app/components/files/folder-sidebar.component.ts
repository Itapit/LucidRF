import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FolderDto } from '@LucidRF/common';

@Component({
  selector: 'app-folder-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folder-sidebar.component.html',
  styles: [
    `
      .bg-black-5 {
        background-color: rgba(0, 0, 0, 0.05);
      }
    `,
  ],
})
export class FolderSidebarComponent {
  @Input() headerVariant: 'initials' | 'icon' = 'initials';
  @Input() initials = '';
  @Input() themeColor = '#000000';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() storageInfo = '';

  @Input() folders: FolderDto[] | null = [];
  @Input() activeFolderId: string | null = null;

  @Output() folderClick = new EventEmitter<string | null>();
}
