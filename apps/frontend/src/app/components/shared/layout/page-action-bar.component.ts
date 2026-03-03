import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-action-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-action-bar.component.html',
})
export class PageActionBarComponent {
  @Input() title?: string;
  @Input() showNewFolder = true;
  @Input() showUpload = true;

  @Output() newFolder = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<void>();
}
