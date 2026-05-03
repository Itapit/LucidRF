import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastType } from '../../types';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  success(title: string, description?: string, durationMs = 4200): string {
    return this.show({ type: ToastType.SUCCESS, title, description }, durationMs);
  }

  info(title: string, description?: string, durationMs = 4200): string {
    return this.show({ type: ToastType.INFO, title, description }, durationMs);
  }

  error(title: string, description?: string, durationMs = 5000): string {
    return this.show({ type: ToastType.ERROR, title, description }, durationMs);
  }

  dismiss(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }

  private show(toast: Omit<ToastMessage, 'id'>, durationMs: number): string {
    const id = this.createToastId();
    const nextToast: ToastMessage = { id, ...toast };
    this.toastsSubject.next([...this.toastsSubject.value, nextToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);

    return id;
  }

  private createToastId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
}
