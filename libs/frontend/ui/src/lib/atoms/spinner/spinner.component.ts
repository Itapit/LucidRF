import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {
  variant = input<'default' | 'svg'>('svg');
  size = input<'sm' | 'md' | 'lg'>('sm');

  sizeClasses() {
    switch (this.size()) {
      case 'sm':
        return 'w-4 h-4 border-2 border-current';
      case 'md':
        return 'w-8 h-8 border-4 border-current';
      case 'lg':
        return 'w-16 h-16 border-4 border-blue-500';
      default:
        return 'w-4 h-4 border-2 border-current';
    }
  }

  svgSizeClasses() {
    switch (this.size()) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-5 w-5';
      case 'lg':
        return 'h-8 w-8';
      default:
        return 'h-4 w-4';
    }
  }
}
