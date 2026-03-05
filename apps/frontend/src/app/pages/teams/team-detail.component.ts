import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
  TopHeaderComponent,
} from '@LucidRF/ui';
import { firstValueFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../auth/store/auth.facade';
import { NavigationService } from '../../core/navigation/navigation.service';
import { FilesFacade } from '../../files/store/files.facade';
import { TeamsFacade } from '../../teams/store/teams.facade';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    TopHeaderComponent,
    FolderSidebarComponent,
    PageActionBarComponent,
    FileTableComponent,
    DialogModule,
    BreadcrumbsComponent,
    DashboardLayoutComponent,
  ],
  templateUrl: './team-detail.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);
  private teamsFacade = inject(TeamsFacade);
  private filesFacade = inject(FilesFacade);
  private authFacade = inject(AuthFacade);

  teamId$: Observable<string>;
  team$: Observable<TeamDto | null>;
  files$ = this.filesFacade.files$;
  folders$ = this.filesFacade.folders$;
  user$ = this.authFacade.user$;
  currentUserRole$: Observable<TeamRole | null>;
  canManageTeam$: Observable<boolean>;

  private dialog = inject(Dialog);

  constructor() {
    this.teamId$ = this.route.params.pipe(map((params) => params['id']));
    this.team$ = this.teamId$.pipe(switchMap((id) => this.teamsFacade.selectTeamById(id)));

    this.currentUserRole$ = this.team$.pipe(
      switchMap((team) =>
        this.user$.pipe(
          map((user) => {
            if (!team || !user) return null;
            const member = team.members.find((m) => m.userId === user.id);
            return member ? (member.role as TeamRole) : null;
          })
        )
      )
    );

    this.canManageTeam$ = this.currentUserRole$.pipe(
      map((role) => role === TeamRole.OWNER || role === TeamRole.MANAGER)
    );
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

  ngOnInit() {
    this.teamId$.subscribe((id) => {
      if (id) {
        this.filesFacade.loadContent(id);
      }
    });
  }

  ngOnDestroy() {
    this.filesFacade.clearContent();
  }

  goHome() {
    this.navigationService.toHome();
  }

  onLogout() {
    this.authFacade.logout();
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
      hasBackdrop: false, // ModalWrapperComponent provides its own backdrop
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

  async openMembers(team: TeamDto) {
    const currentUserRole = await firstValueFrom(this.currentUserRole$).catch(() => null);
    const user = await firstValueFrom(this.user$).catch(() => null);
    const currentUserId = user?.id || '';

    const dialogRef = this.dialog.open(MemberListComponent, {
      data: { team, currentUserRole, currentUserId },
      hasBackdrop: false, // ModalWrapperComponent provides its own backdrop
    });

    // Listen to component instance events natively without closing dialog
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
    this.teamsFacade.updateTeam(id, data);
  }

  private onDeleteTeam(id: string) {
    this.teamsFacade.deleteTeam(id);
    this.navigationService.toHome();
  }

  private onInviteMember(teamId: string, identifier: string) {
    this.teamsFacade.addMember(teamId, { identifier, role: TeamRole.MEMBER });
  }

  private onUpdateMemberRole(teamId: string, event: { userId: string; role: TeamRole }) {
    this.teamsFacade.updateMemberRole(teamId, event.userId, { role: event.role });
  }

  private onRemoveMember(teamId: string, userId: string) {
    this.teamsFacade.removeMember(teamId, { targetUserId: userId });
  }
}
