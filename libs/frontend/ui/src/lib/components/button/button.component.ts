import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
})
export class UiButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  get classes() {
    const baseClasses =
      'transition-colors font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-5 py-2.5 text-base rounded-xl',
    }[this.size()];

    const variantClasses = {
      primary: 'bg-black text-white hover:bg-gray-800 shadow-sm active:scale-95',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm active:scale-95',
      ghost: 'text-gray-600 hover:text-black hover:bg-gray-200',
      danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white active:scale-95',
    }[this.variant()];

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass}`;
  }

  onClick(event: MouseEvent) {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
