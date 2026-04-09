import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  type = input<'error' | 'warning' | 'info' | 'success'>('error');
  message = input<string | null>(null);

  classes = computed(() => {
    const baseClasses = 'border p-3 mb-6 rounded-md flex items-start gap-2';
    switch (this.type()) {
      case 'error':
        return `${baseClasses} bg-red-50 border-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-200`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-200`;
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200`;
      default:
        return baseClasses;
    }
  });

  iconClasses = computed(() => {
    const base = 'h-4 w-4 mt-0.5 flex-shrink-0';
    switch (this.type()) {
      case 'error':
        return `${base} text-red-500`;
      case 'warning':
        return `${base} text-yellow-500`;
      case 'info':
        return `${base} text-blue-500`;
      case 'success':
        return `${base} text-green-500`;
      default:
        return base;
    }
  });

  textClasses = computed(() => {
    const base = 'text-xs font-medium leading-relaxed';
    switch (this.type()) {
      case 'error':
        return `${base} text-red-700`;
      case 'warning':
        return `${base} text-yellow-700`;
      case 'info':
        return `${base} text-blue-700`;
      case 'success':
        return `${base} text-green-700`;
      default:
        return base;
    }
  });
}
