import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ComponentSize } from '../../types';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {
  variant = input<'default' | 'svg'>('svg');
  size = input<ComponentSize>(ComponentSize.Small);

  sizeClasses() {
    switch (this.size()) {
      case ComponentSize.Small:
        return 'w-4 h-4 border-2 border-current';
      case ComponentSize.Medium:
        return 'w-8 h-8 border-4 border-current';
      case ComponentSize.Large:
        return 'w-16 h-16 border-4 border-blue-500';
      case ComponentSize.ExtraLarge:
        return 'w-24 h-24 border-4 border-blue-500';
      default:
        return 'w-4 h-4 border-2 border-current';
    }
  }

  svgSizeClasses() {
    switch (this.size()) {
      case ComponentSize.Small:
        return 'h-4 w-4';
      case ComponentSize.Medium:
        return 'h-5 w-5';
      case ComponentSize.Large:
        return 'h-8 w-8';
      case ComponentSize.ExtraLarge:
        return 'h-12 w-12';
      default:
        return 'h-4 w-4';
    }
  }
}
