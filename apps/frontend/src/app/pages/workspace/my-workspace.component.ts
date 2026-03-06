import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { TeamColor } from '@LucidRF/common';
import { BreadcrumbItem, WorkspaceShellComponent } from '@LucidRF/ui';
import { MyWorkspaceStore } from './my-workspace.store';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [CommonModule, WorkspaceShellComponent],
  templateUrl: './my-workspace.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
  providers: [MyWorkspaceStore],
})
export class MyWorkspaceComponent implements OnDestroy {
  readonly store = inject(MyWorkspaceStore);

  defaultColor = TeamColor.SIGNAL_BLUE;

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'workspace-root', label: 'My Workspace' },
    ];
  }

  constructor() {
    effect(() => {
      this.store.initWorkspace();
    });
  }

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === 'home') {
      this.store.goHome();
    } else if (item.id === 'workspace-root') {
      // Navigate to workspace root if implemented
    }
  }

  ngOnDestroy() {
    this.store.clearWorkspaceContent();
  }
}
