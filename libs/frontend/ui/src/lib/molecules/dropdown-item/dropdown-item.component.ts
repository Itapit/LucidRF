import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-dropdown-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown-item.component.html',
})
export class DropdownItemComponent {
  variant = input<'default' | 'danger'>('default');
  itemClick = output<MouseEvent>();
}
