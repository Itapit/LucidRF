
import { Component, input, output } from '@angular/core';
import { BreadcrumbItem } from './breadcrumbs.types';

@Component({
  selector: 'ui-breadcrumbs',
  standalone: true,
  imports: [],
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent {
  items = input<BreadcrumbItem[]>([]);
  itemClick = output<BreadcrumbItem>();
}
