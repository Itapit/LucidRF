import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';

import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {
  /** Default includes `w-full` for layouts like the profile sidebar; use `relative inline-block` for compact triggers (e.g. table actions). */
  containerClass = input('relative inline-block w-full');

  positions = input<ConnectedPosition[]>([
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
  ]);

  isOpen = signal(false);

  toggle() {
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }
}
