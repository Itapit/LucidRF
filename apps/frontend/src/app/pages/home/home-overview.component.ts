import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthFacade } from '../../auth/store/auth.facade';
import { TopHeaderComponent } from '../../components/shared/layout/top-header.component';
import { DialogAction, DialogResult } from '../../components/shared/modals/dialog.types';
import { TeamCardComponent } from '../../components/teams/team-card.component';
import { TeamFormComponent } from '../../components/teams/team-form.component';
import { NavigationService } from '../../core/navigation/navigation.service';
import { TeamsFacade } from '../../teams/store/teams.facade';

@Component({
  selector: 'app-home-overview',
  standalone: true,
  imports: [CommonModule, TopHeaderComponent, TeamCardComponent, DialogModule],
  templateUrl: './home-overview.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class HomeOverviewComponent {
  private teamsFacade = inject(TeamsFacade);
  private authFacade = inject(AuthFacade);
  private navigationService = inject(NavigationService);

  teams$ = this.teamsFacade.teams$;
  personalTeam$ = this.teamsFacade.personalTeam$;
  collaborativeTeams$ = this.teamsFacade.collaborativeTeams$;
  user$ = this.authFacade.user$;

  private dialog = inject(Dialog);

  onLogout() {
    this.authFacade.logout();
  }

  onEditProfile() {
    // Navigate or open modal
  }

  goToTeam(teamId: string) {
    this.navigationService.toTeam(teamId);
  }

  openCreateTeam() {
    const dialogRef = this.dialog.open<DialogResult<{ name: string; description: string }>>(TeamFormComponent, {
      data: { team: null, showDangerZone: false },
      hasBackdrop: false,
    });

    dialogRef.closed.subscribe((result: DialogResult | undefined) => {
      if (result?.action === DialogAction.SUBMIT && result.data) {
        this.teamsFacade.createTeam(result.data as { name: string; description: string });
      }
    });
  }
}
