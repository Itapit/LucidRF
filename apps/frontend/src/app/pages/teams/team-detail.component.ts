import { Dialog, DialogModule } from '@angular/cdk/dialog';

import { Component, effect, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FileDto, FolderDto, TeamColor, TeamDto, TeamRole, UpdateTeamRequest } from '@LucidRF/common';
import {
  BreadcrumbItem,
  DialogAction,
  DialogResult,
  MemberListComponent,
  TeamFormComponent,
  WorkspaceShellComponent,
  MlAnalysisModalComponent,
  MlAnalysisModalData,
} from '@LucidRF/ui';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { TeamDetailStore } from './team-detail.store';
import { NavigationService } from '../../core/navigation/navigation.service';
import { FilesService } from '../../files/services/files.service';
import { TeamType } from '@LucidRF/common';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [DialogModule, WorkspaceShellComponent],
  providers: [TeamDetailStore],
  templateUrl: './team-detail.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class TeamDetailComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);
  private navigationService = inject(NavigationService);
  private filesService = inject(FilesService);

  // Inject our local store
  readonly store = inject(TeamDetailStore);

  // Convert Route Param to Signal
  private teamIdParam = toSignal(this.route.params.pipe(map((params) => params['id'])));

  constructor() {
    effect(() => {
      const id = this.teamIdParam();
      if (id) {
        this.store.setTeamId(id);
      }
    });

    effect(() => {
      const team = this.store.team();
      if (team && team.type === TeamType.PERSONAL) {
        this.navigationService.toWorkspace();
      }
    });
  }

  getBreadcrumbs(team: TeamDto | null): BreadcrumbItem[] {
    if (!team) return [];
    const baseBreadcrumbs: BreadcrumbItem[] = [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: team.id, label: team.name },
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

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === 'home') {
      this.store.goHome();
    } else {
      const teamId = this.teamIdParam();
      if (!teamId) return;

      if (item.id === teamId) {
        this.store.loadWorkspaceContent(teamId, undefined);
      } else {
        this.store.loadWorkspaceContent(teamId, item.id);
      }
    }
  }

  ngOnDestroy() {
    this.store.clearWorkspaceContent();
  }

  openSettings(team: TeamDto) {
    const dialogRef = this.dialog.open<DialogResult<{ name: string; description: string; color: TeamColor }>>(
      TeamFormComponent,
      {
        data: { team, showDangerZone: true },
      }
    );

    dialogRef.closed.subscribe((result: DialogResult<{ name: string; description: string; color: TeamColor }> | undefined) => {
      if (!result) return;
      if (result.action === DialogAction.SUBMIT && result.data) {
        const d = result.data;
        const update: UpdateTeamRequest = {
          name: d.name,
          description: d.description,
          color: d.color,
        };
        this.store.updateTeam(team.id, update);
      } else if (result.action === DialogAction.DELETE) {
        this.store.deleteTeam(team.id);
        this.store.goHome();
      }
    });
  }

  openMembers(team: TeamDto) {
    const role = this.store.currentUserRole();
    const currentUser = this.store.user();
    const currentUserId = currentUser?.id || '';

    const dialogRef = this.dialog.open(MemberListComponent, {
      data: { team, currentUserRole: role, currentUserId },
    });

    if (dialogRef.componentInstance) {
      dialogRef.componentInstance.inviteMember.subscribe((identifier: string) => {
        this.store.inviteMember(team.id, identifier);
      });
      dialogRef.componentInstance.removeMember.subscribe((userId: string) => {
        this.store.removeMember(team.id, userId);
      });
      dialogRef.componentInstance.updateRole.subscribe((event: { userId: string; role: TeamRole }) => {
        this.store.updateMemberRole(team.id, event.userId, event.role);
      });
    }
  }

  onViewAnalysis(file: FileDto) {
    const allFiles = this.store.files() || [];
    
    // Find the associated system files
    const cleanFile = allFiles.find(f => f.uploadedBy === 'SYSTEM' && f.originalFileName === `Clean_${file.originalFileName}`);
    const spectrogramFile = allFiles.find(f => f.uploadedBy === 'SYSTEM' && f.originalFileName === `${file.originalFileName}_Spectrogram.png`);

    this.dialog.open<void, MlAnalysisModalData>(MlAnalysisModalComponent, {
      width: '900px',
      data: {
        originalFile: file,
        cleanFile,
        spectrogramFile,
        getDownloadUrl: async (fileId: string) => {
          const res = await firstValueFrom(this.filesService.getDownloadUrl(fileId));
          return res.url;
        },
        onDownloadFile: (f: FileDto) => {
          this.store.onDownloadFile(f);
        }
      }
    });
  }
}
