import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamDto } from '@LucidRF/common';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../auth/store/auth.facade';
import { FileTableComponent } from '../../components/files/file-table.component';
import { FolderSidebarComponent } from '../../components/files/folder-sidebar.component';
import { PageActionBarComponent } from '../../components/shared/layout/page-action-bar.component';
import { TopHeaderComponent } from '../../components/shared/layout/top-header.component';
import { MemberListComponent } from '../../components/teams/member-list.component';
import { TeamFormComponent } from '../../components/teams/team-form.component';
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
    TeamFormComponent,
    MemberListComponent,
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
  isOwner$: Observable<boolean>;

  showSettings = false;
  showMembers = false;

  constructor() {
    this.teamId$ = this.route.params.pipe(map((params) => params['id']));
    this.team$ = this.teamId$.pipe(switchMap((id) => this.teamsFacade.selectTeamById(id)));

    this.isOwner$ = this.team$.pipe(
      switchMap((team) =>
        this.user$.pipe(
          map((user) => {
            if (!team || !user) return false;
            const member = team.members.find((m) => m.userId === user.id);
            return member?.role === 'OWNER';
          })
        )
      )
    );
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

  onFolderClick(folderId: string | null) {
    // Navigate or filter
  }

  onNewFolder() {
    // Open modal to create folder
  }

  onUploadFile() {
    // Open upload flow
  }

  onUpdateTeam(id: string, data: any) {
    this.teamsFacade.updateTeam(id, data);
    this.showSettings = false;
  }

  onDeleteTeam(id: string) {
    this.teamsFacade.deleteTeam(id);
    this.navigationService.toHome();
  }

  onInviteMember(teamId: string, emailOrId: string) {
    this.teamsFacade.addMember(teamId, { targetUserId: emailOrId, role: 'MEMBER' as any });
  }

  onRemoveMember(teamId: string, userId: string) {
    this.teamsFacade.removeMember(teamId, { targetUserId: userId });
  }
}
