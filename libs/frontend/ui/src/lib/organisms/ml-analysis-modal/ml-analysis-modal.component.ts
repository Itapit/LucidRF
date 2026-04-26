import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FileDto } from '@LucidRF/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ModalWrapperComponent } from '../../molecules/modal-wrapper/modal-wrapper.component';

export interface MlAnalysisModalData {
  originalFile: FileDto;
  cleanFile?: FileDto;
  spectrogramFile?: FileDto;
  getDownloadUrl: (fileId: string) => Promise<string>;
  onDownloadFile: (file: FileDto) => void;
}

@Component({
  selector: 'ui-ml-analysis-modal',
  standalone: true,
  imports: [CommonModule, ModalWrapperComponent, ButtonComponent],
  templateUrl: './ml-analysis-modal.component.html',
})
export class MlAnalysisModalComponent implements OnInit {
  dialogRef = inject(DialogRef, { optional: true });
  data = inject<MlAnalysisModalData>(DIALOG_DATA);

  spectrogramUrl = signal<string | null>(null);

  get metadata() {
    return this.data.originalFile.metadata;
  }

  async ngOnInit() {
    if (this.data.spectrogramFile) {
      const url = await this.data.getDownloadUrl(this.data.spectrogramFile.resourceId);
      this.spectrogramUrl.set(url);
    }
  }

  onClose() {
    this.dialogRef?.close();
  }

  downloadClean() {
    if (this.data.cleanFile) {
      this.data.onDownloadFile(this.data.cleanFile);
    }
  }

  downloadOriginal() {
    this.data.onDownloadFile(this.data.originalFile);
  }
}
