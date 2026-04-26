import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type FileCategory = 'folder' | 'image' | 'sdr' | 'archive' | 'code' | 'document';

@Component({
  selector: 'ui-file-icon',
  standalone: true,
  templateUrl: './file-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileIconComponent {
  isFolder = input<boolean>(false);
  fileName = input<string>('');

  category = computed<FileCategory>(() => {
    if (this.isFolder()) return 'folder';

    const name = (this.fileName() || '').toLowerCase();
    const extension = name.split('.').pop() || '';

    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    const sdrExts = ['bin', 'iq', 'sigmf', 'sigmf-data', 'sigmf-meta', 'dat', 'cu8', 'cf32'];
    const archiveExts = ['zip', 'tar', 'gz', 'rar', '7z', 'bz2'];
    const codeExts = [
      'ts',
      'js',
      'html',
      'css',
      'scss',
      'py',
      'json',
      'yaml',
      'yml',
      'md',
      'sh',
      'java',
      'c',
      'cpp',
      'rs',
      'go',
    ];

    if (imageExts.includes(extension)) return 'image';
    if (sdrExts.includes(extension)) return 'sdr';
    if (archiveExts.includes(extension)) return 'archive';
    if (codeExts.includes(extension)) return 'code';

    return 'document';
  });
}
