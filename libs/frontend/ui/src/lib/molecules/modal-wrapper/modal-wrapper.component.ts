import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ui-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal-wrapper.component.html',
  styles: [
    `
      .animate-slide-up {
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class ModalWrapperComponent implements AfterViewInit, OnDestroy {
  title = input<string>('');
  maxWidthClass = input<string>('max-w-md');
  showFooter = input<boolean>(true);

  closeModal = output<void>();

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.appendChild(document.body, this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.el.nativeElement && this.el.nativeElement.parentNode === document.body) {
        this.renderer.removeChild(document.body, this.el.nativeElement);
      }
    }
  }
}
