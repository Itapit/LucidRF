import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastType } from '../../types';
import { ToastService } from './toast.service';

@Component({
  selector: 'ui-toast-viewport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-viewport.component.html',
})
export class ToastViewportComponent {
  private readonly toastService = inject(ToastService);

  readonly toasts = toSignal(this.toastService.toasts$, { initialValue: [] });
  readonly toastType = ToastType;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getContainerClasses(type: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS:
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
      case ToastType.ERROR:
        return 'border-red-200 bg-red-50/95 text-red-900';
      case ToastType.INFO:
      default:
        return 'border-sky-200 bg-sky-50/95 text-sky-900';
    }
  }

  getIconClasses(type: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS:
        return 'text-emerald-600';
      case ToastType.ERROR:
        return 'text-red-600';
      case ToastType.INFO:
      default:
        return 'text-sky-600';
    }
  }
}
