import { effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FileStatus } from '@LucidRF/common';
import { signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
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
        const team = store.team();
        if (team?.id) {
          store.loadWorkspaceContent(team.id);
        }
      },
    };
  }),
  withHooks({
    onInit(store) {
      effect((onCleanup) => {
        // Reactively track the current files and team state
        const files = store.files();
        const team = store.team();
        const currentFolderId = store.currentFolder()?.resourceId;

        // Check if any file is in a transitional state
        const hasProcessingFiles = files.some(
          (f) =>
            f.status === FileStatus.PROCESSING || f.status === FileStatus.UPLOADED || f.status === FileStatus.PENDING
        );

        // If there are processing files, start an interval
        if (hasProcessingFiles && team?.id) {
          const intervalId = setInterval(() => {
            store.pollWorkspaceContent(team.id, currentFolderId);
          }, 4000); // 4 seconds is a good balance between responsiveness and API load

          // Automatically clear the interval when the state changes
          onCleanup(() => {
            clearInterval(intervalId);
          });
        }
      });
    },
  })
);
