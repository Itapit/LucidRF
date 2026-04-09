
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TeamColor } from '@LucidRF/common';

@Component({
  selector: 'ui-workspace-header',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-header.component.html',
})
export class WorkspaceHeaderComponent {
  title = input.required<string>();
  initials = input.required<string>();
  subtitle = input<string>('');
  themeColor = input<string>(TeamColor.SIGNAL_BLUE);
}
