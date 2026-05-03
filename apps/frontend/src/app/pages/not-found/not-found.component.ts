import { Component, inject } from '@angular/core';
import { ButtonComponent, ComponentSize } from '@LucidRF/ui';
import { NavigationService } from '../../core/navigation/navigation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  private navigationService = inject(NavigationService);
  ComponentSize = ComponentSize;

  goHome() {
    this.navigationService.toHome();
  }
}
