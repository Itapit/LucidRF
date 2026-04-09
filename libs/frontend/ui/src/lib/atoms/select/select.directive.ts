import { Directive, HostBinding, input } from '@angular/core';

@Directive({
  selector: 'select[uiSelect]',
  standalone: true,
})
export class SelectDirective {
  size = input<'sm' | 'md'>('md');

  @HostBinding('class')
  get classes(): string {
    const baseClasses =
      'bg-gray-50 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-black cursor-pointer text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full';

    if (this.size() === 'sm') {
      return `${baseClasses} px-1.5 py-0.5`;
    }

    return `${baseClasses} px-3 py-2`;
  }
}
