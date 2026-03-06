import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SystemRole } from '@LucidRF/common';
import { AuthFacade } from './auth/store/auth.facade';
import { NavigationService } from './core/navigation/navigation.service';
import { CoreFacade } from './core/store/core.facade';
import { TeamsFacade } from './teams/store/teams.facade';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
})
export class AppComponent {
  private coreFacade = inject(CoreFacade);
  private authFacade = inject(AuthFacade);
  private teamsFacade = inject(TeamsFacade);
  private navigationService = inject(NavigationService);

  globalError = toSignal(this.coreFacade.globalError$, { initialValue: null });
  isAppLoading = toSignal(this.authFacade.isAppLoading$, { initialValue: true });
  isLoggedIn = toSignal(this.authFacade.isLoggedIn$, { initialValue: false });
  role = toSignal(this.authFacade.role$, { initialValue: null });
  user = toSignal(this.authFacade.user$, { initialValue: null });
  teams = toSignal(this.teamsFacade.collaborativeTeams$, { initialValue: [] });

  SystemRole = SystemRole;

  reloadApp(): void {
    window.location.reload();
  }

  // Sidebar Actions
  goHome() {
    this.navigationService.toHome();
  }

  goWorkspace() {
    this.navigationService.toWorkspace();
  }

  goTeam(teamId: string) {
    this.navigationService.toTeam(teamId);
  }

  goAdmin() {
    this.navigationService.toAdmin();
  }

  openUpload() {
    // Open upload modal or logic
  }

  logout() {
    this.authFacade.logout();
  }

  editProfile() {
    // Navigate or open modal
  }
}
