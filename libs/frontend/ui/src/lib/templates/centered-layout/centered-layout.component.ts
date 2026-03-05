import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-centered-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './centered-layout.component.html',
})
export class CenteredLayoutComponent {
  title = input.required<string>();
  subtitle = input<string>();
}
