import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ComponentSize } from '../../types';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {
  src = input<string | null>(null);
  alt = input<string>('');
  initials = input<string | null>(null);
  color = input<string | null>(null);
  size = input<ComponentSize>(ComponentSize.Medium);
  bordered = input<boolean>(false);

  imageError = false;

  get classes() {
    const baseClasses = 'rounded-full overflow-hidden flex-shrink-0';
    const borderClasses = this.bordered() ? 'border-2 border-white shadow-sm' : '';

    const sizeClasses = {
      [ComponentSize.Small]: 'w-8 h-8',
      [ComponentSize.Medium]: 'w-10 h-10',
      [ComponentSize.Large]: 'w-12 h-12',
      [ComponentSize.ExtraLarge]: 'w-16 h-16',
    }[this.size()];

    return `${baseClasses} ${borderClasses} ${sizeClasses}`;
  }

  get textClasses() {
    return {
      [ComponentSize.Small]: 'text-xs',
      [ComponentSize.Medium]: 'text-sm',
      [ComponentSize.Large]: 'text-base',
      [ComponentSize.ExtraLarge]: 'text-xl',
    }[this.size()];
  }

  handleImageError() {
    this.imageError = true;
    // We could potentially update a signal here to switch to fallback,
    // but the simplest approach for now is just to rely on the consumer providing initials or color.
  }
}
