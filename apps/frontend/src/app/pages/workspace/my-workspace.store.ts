import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { signalStore, withComputed, withMethods } from '@ngrx/signals';
import { AuthFacade } from '../../auth/store/auth.facade';
import { withWorkspace } from '../../core/features/with-workspace.feature';
import { TeamsFacade } from '../../teams/store/teams.facade';

export const MyWorkspaceStore = signalStore(
  withWorkspace(),
  withComputed(() => {
    const authFacade = inject(AuthFacade);
    const teamsFacade = inject(TeamsFacade);
    const user = toSignal(authFacade.user$, { initialValue: null });
    const team = toSignal(teamsFacade.personalTeam$, { initialValue: null });
    return { user, team };
  }),
  withMethods((store) => {
    return {
      initWorkspace: () => {
        const t = store.team();
        if (t?.id) {
          store.loadWorkspaceContent(t.id);
        }
      },
    };
  })
);
