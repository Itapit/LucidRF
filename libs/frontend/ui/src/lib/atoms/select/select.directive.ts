import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: 'select[uiSelect]',
  standalone: true,
})
export class SelectDirective {
  @HostBinding('class')
  get classes(): string {
    return 'bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-black cursor-pointer text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed';
  }
}
