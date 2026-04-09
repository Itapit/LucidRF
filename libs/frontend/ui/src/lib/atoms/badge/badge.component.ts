import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  status = input<'success' | 'warning' | 'error' | 'neutral' | 'info'>('neutral');
  label = input<string>('');
  showDot = input<boolean>(true);

  get statusClasses() {
    switch (this.status()) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'neutral':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  get dotClasses() {
    switch (this.status()) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      case 'neutral':
      default:
        return 'bg-gray-400';
    }
  }
}
