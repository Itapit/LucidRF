import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, input, output } from '@angular/core';
import { ButtonComponent } from '../../atoms';

@Component({
  selector: 'ui-page-action-bar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-action-bar.component.html',
})
export class PageActionBarComponent {
  title = input<string | undefined>();
  showNewFolder = input<boolean>(true);
  showUpload = input<boolean>(true);

  newFolder = output<void>();
  uploadFile = output<File>();

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
