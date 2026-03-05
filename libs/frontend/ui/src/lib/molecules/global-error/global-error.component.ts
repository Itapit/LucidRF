import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../atoms';

@Component({
  selector: 'ui-global-error',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './global-error.component.html',
})
export class GlobalErrorComponent {
  error = input.required<string>();
  retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
