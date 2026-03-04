import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../atoms';

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
  uploadFile = output<void>();
}
