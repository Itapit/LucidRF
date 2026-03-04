import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FolderDto } from '@LucidRF/common';

@Component({
  selector: 'ui-folder-sidebar',
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
  headerVariant = input<'initials' | 'icon'>('initials');
  initials = input<string>('');
  themeColor = input<string>('#000000');
  title = input<string>('');
  subtitle = input<string>('');
  storageInfo = input<string>('');

  folders = input<FolderDto[] | null>([]);
  activeFolderId = input<string | null>(null);

  folderClick = output<string | null>();
}
