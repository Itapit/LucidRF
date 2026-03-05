import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent, CenteredLayoutComponent } from '@LucidRF/ui';
import { NavigationService } from '../../core/navigation/navigation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CenteredLayoutComponent],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  private navigationService = inject(NavigationService);

  goHome() {
    this.navigationService.toHome();
  }
}
