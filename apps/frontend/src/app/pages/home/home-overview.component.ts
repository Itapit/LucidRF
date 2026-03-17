import { Dialog, DialogModule } from '@angular/cdk/dialog';

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  DashboardLayoutComponent,
  DialogAction,
  DialogResult,
  TeamCardComponent,
  TeamFormComponent,
} from '@LucidRF/ui';
import { AuthFacade } from '../../auth/store/auth.facade';
import { NavigationService } from '../../core/navigation/navigation.service';
import { TeamsFacade } from '../../teams/store/teams.facade';

@Component({
  selector: 'app-home-overview',
  standalone: true,
  imports: [TeamCardComponent, DialogModule, DashboardLayoutComponent],
  templateUrl: './home-overview.component.html',
  host: { class: 'flex-1 flex overflow-hidden w-full h-full' },
})
export class HomeOverviewComponent {
  private teamsFacade = inject(TeamsFacade);
  private authFacade = inject(AuthFacade);
  private navigationService = inject(NavigationService);

  teams = toSignal(this.teamsFacade.teams$, { initialValue: [] });
  personalTeam = toSignal(this.teamsFacade.personalTeam$, { initialValue: null });
  collaborativeTeams = toSignal(this.teamsFacade.collaborativeTeams$, { initialValue: [] });
  user = toSignal(this.authFacade.user$, { initialValue: null });

  private dialog = inject(Dialog);

  goToTeam(teamId: string) {
    this.navigationService.toTeam(teamId);
  }

  openCreateTeam() {
    const dialogRef = this.dialog.open<DialogResult<{ name: string; description: string }>>(TeamFormComponent, {
      data: { team: null, showDangerZone: false },
    });

    dialogRef.closed.subscribe((result: DialogResult | undefined) => {
      if (result?.action === DialogAction.SUBMIT && result.data) {
        this.teamsFacade.createTeam(result.data as { name: string; description: string });
      }
    });
  }
}
