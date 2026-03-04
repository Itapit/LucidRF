import { Directive, HostBinding, input } from '@angular/core';

@Directive({
  selector: '[uiInput]',
  standalone: true,
})
export class UiInputDirective {
  // Can add inputs like size, error state, etc.
  hasError = input<boolean>(false);

  @HostBinding('class')
  get classes(): string {
    const baseClasses =
      'w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

    if (this.hasError()) {
      return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300`;
    }

    return `${baseClasses} border-gray-300 focus:ring-black focus:border-black text-gray-900`;
  }
}
