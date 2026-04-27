import { Directive, HostBinding, input } from '@angular/core';
import { ComponentSize } from '../../types';

@Directive({
  selector: 'select[uiSelect]',
  standalone: true,
})
export class SelectDirective {
  size = input<ComponentSize>(ComponentSize.Medium);

  @HostBinding('class')
  get classes(): string {
    const baseClasses =
      'bg-gray-50 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-black cursor-pointer text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full';

    if (this.size() === ComponentSize.Small) {
      return `${baseClasses} px-1.5 py-0.5`;
    }

    if (this.size() === ComponentSize.Large) {
      return `${baseClasses} px-4 py-3`;
    }

    if (this.size() === ComponentSize.ExtraLarge) {
      return `${baseClasses} px-5 py-4`;
    }

    return `${baseClasses} px-3 py-2`;
  }
}
