import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'ui-modal-wrapper',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
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
export class ModalWrapperComponent {
  title = input<string>('');
  maxWidthClass = input<string>('max-w-md');
  showFooter = input<boolean>(true);

  // Standard Action Buttons Configuration
  formId = input<string | undefined>();
  submitText = input<string>('Save');
  cancelText = input<string>('Cancel');
  submitDisabled = input<boolean>(false);
  isSubmitting = input<boolean>(false);

  closeModal = output<void>();
  submitModal = output<void>();
}
