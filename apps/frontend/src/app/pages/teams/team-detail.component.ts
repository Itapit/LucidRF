import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TeamDto, TeamRole } from '@LucidRF/common';
import {
  BreadcrumbItem,
  BreadcrumbsComponent,
  DashboardLayoutComponent,
  DialogAction,
  DialogResult,
  FileTableComponent,
  FolderSidebarComponent,
  MemberListComponent,
  PageActionBarComponent,
  TeamFormComponent,
} from '@LucidRF/ui';
import { map } from 'rxjs/operators';
import { NavigationService } from '../../core/navigation/navigation.service';
import { TeamDetailStore } from './team-detail.store';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    FolderSidebarComponent,
    PageActionBarComponent,
    FileTableComponent,
    DialogModule,
    BreadcrumbsComponent,
    DashboardLayoutComponent,
  ],
  providers: [TeamDetailStore],
  templateUrl: './team-detail.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class TeamDetailComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);
  private dialog = inject(Dialog);

  // Inject our newly created local store
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
      this.goHome();
    } else {
      // Navigate to team root if we implement nested folders
    }
  }

  ngOnDestroy() {
    this.store.clearContent();
  }

  goHome() {
    this.navigationService.toHome();
  }

  onFolderClick() {
    // Navigate or filter
  }

  onNewFolder() {
    // Open modal to create folder
  }

  onUploadFile() {
    // Open upload flow
  }

  openSettings(team: TeamDto) {
    const dialogRef = this.dialog.open<DialogResult<Partial<TeamDto>>>(TeamFormComponent, {
      data: { team, showDangerZone: true },
      hasBackdrop: false,
    });

    dialogRef.closed.subscribe((result: DialogResult | undefined) => {
      if (!result) return;
      if (result.action === DialogAction.SUBMIT && result.data) {
        this.onUpdateTeam(team.id, result.data as Partial<TeamDto>);
      } else if (result.action === DialogAction.DELETE) {
        this.onDeleteTeam(team.id);
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
        this.onInviteMember(team.id, identifier);
      });
      dialogRef.componentInstance.removeMember.subscribe((userId: string) => {
        this.onRemoveMember(team.id, userId);
      });
      dialogRef.componentInstance.updateRole.subscribe((event: { userId: string; role: TeamRole }) => {
        this.onUpdateMemberRole(team.id, event);
      });
    }
  }

  private onUpdateTeam(id: string, data: Partial<TeamDto>) {
    this.store.updateTeam(id, data);
  }

  private onDeleteTeam(id: string) {
    this.store.deleteTeam(id);
    this.navigationService.toHome();
  }

  private onInviteMember(teamId: string, identifier: string) {
    this.store.inviteMember(teamId, identifier);
  }

  private onUpdateMemberRole(teamId: string, event: { userId: string; role: TeamRole }) {
    this.store.updateMemberRole(teamId, event.userId, event.role);
  }

  private onRemoveMember(teamId: string, userId: string) {
    this.store.removeMember(teamId, userId);
  }
}
