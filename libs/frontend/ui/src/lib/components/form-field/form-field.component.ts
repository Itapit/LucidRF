import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
})
export class UiFormFieldComponent {
  label = input<string>('');
  forId = input<string>('');
  error = input<string | null>(null);
  hint = input<string | null>(null);
  required = input<boolean>(false);
}
