import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
})
export class UiAvatarComponent {
  src = input<string | null>(null);
  alt = input<string>('');
  initials = input<string | null>(null);
  color = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  bordered = input<boolean>(false);

  imageError = false;

  get classes() {
    const baseClasses = 'rounded-full overflow-hidden flex-shrink-0';
    const borderClasses = this.bordered() ? 'border-2 border-white shadow-sm' : '';

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    }[this.size()];

    return `${baseClasses} ${borderClasses} ${sizeClasses}`;
  }

  get textClasses() {
    return {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-xl',
    }[this.size()];
  }

  handleImageError() {
    this.imageError = true;
    // We could potentially update a signal here to switch to fallback,
    // but the simplest approach for now is just to rely on the consumer providing initials or color.
  }
}
