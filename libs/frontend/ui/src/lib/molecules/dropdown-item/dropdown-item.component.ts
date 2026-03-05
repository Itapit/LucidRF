import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-dropdown-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown-item.component.html',
})
export class DropdownItemComponent {
  @Input() variant: 'default' | 'danger' = 'default';
  @Output() itemClick = new EventEmitter<MouseEvent>();
}
