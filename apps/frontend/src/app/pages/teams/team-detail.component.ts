import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TeamDto, TeamRole } from '@LucidRF/common';
import { BreadcrumbItem, DialogAction, DialogResult, MemberListComponent, TeamFormComponent } from '@LucidRF/ui';
import { map } from 'rxjs/operators';
import { WorkspaceShellComponent } from '../../shared/workspace/workspace-shell/workspace-shell.component';
import { TeamDetailStore } from './team-detail.store';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, DialogModule, WorkspaceShellComponent],
  providers: [TeamDetailStore],
  templateUrl: './team-detail.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class TeamDetailComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);

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
  }

  getBreadcrumbs(team: TeamDto | null): BreadcrumbItem[] {
    if (!team) return [];
    return [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: team.id, label: team.name },
    ];
  }

  onBreadcrumbClick(item: BreadcrumbItem) {
    if (item.id === 'home') {
      this.store.goHome();
    } else {
      // Navigate to team root if we implement nested folders
    }
  }

  ngOnDestroy() {
    this.store.clearWorkspaceContent();
  }

  openSettings(team: TeamDto) {
    const dialogRef = this.dialog.open<DialogResult<Partial<TeamDto>>>(TeamFormComponent, {
      data: { team, showDangerZone: true },
      hasBackdrop: false,
    });

    dialogRef.closed.subscribe((result: DialogResult | undefined) => {
      if (!result) return;
      if (result.action === DialogAction.SUBMIT && result.data) {
        this.store.updateTeam(team.id, result.data as Partial<TeamDto>);
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
      hasBackdrop: false,
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
}
