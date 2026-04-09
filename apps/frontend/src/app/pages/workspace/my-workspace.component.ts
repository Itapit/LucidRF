
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { FolderDto, TeamColor } from '@LucidRF/common';
import { BreadcrumbItem, WorkspaceShellComponent } from '@LucidRF/ui';
import { MyWorkspaceStore } from './my-workspace.store';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [WorkspaceShellComponent],
  templateUrl: './my-workspace.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
  providers: [MyWorkspaceStore],
})
export class MyWorkspaceComponent implements OnDestroy {
  readonly store = inject(MyWorkspaceStore);

  defaultColor = TeamColor.SIGNAL_BLUE;

  get breadcrumbs(): BreadcrumbItem[] {
    const baseBreadcrumbs: BreadcrumbItem[] = [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'workspace-root', label: 'My Workspace' },
    ];

    const ancestors = this.store.ancestors?.() || [];
    const currentFolder = this.store.currentFolder?.();

    const ancestorBreadcrumbs = ancestors.map((folder: FolderDto) => ({
      id: folder.resourceId,
      label: folder.name,
    }));

    if (currentFolder) {
      ancestorBreadcrumbs.push({ id: currentFolder.resourceId, label: currentFolder.name });
    }

    return [...baseBreadcrumbs, ...ancestorBreadcrumbs];
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
      const teamId = this.store.team()?.id;
      if (teamId) {
        this.store.loadWorkspaceContent(teamId, undefined);
      }
    } else {
      const teamId = this.store.team()?.id;
      if (teamId) {
        this.store.loadWorkspaceContent(teamId, item.id);
      }
    }
  }

  ngOnDestroy() {
    this.store.clearWorkspaceContent();
  }
}
