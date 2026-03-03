import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-modal-wrapper',
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
  @Input() title = '';
  @Input() maxWidthClass = 'max-w-md';
  @Input() showFooter = true;

  @Output() closeModal = new EventEmitter<void>();

  constructor(private el: ElementRef, private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: object) {}

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
