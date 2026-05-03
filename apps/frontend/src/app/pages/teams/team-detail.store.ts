import { computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FileStatus, TeamDto, TeamRole, UpdateTeamRequest } from '@LucidRF/common';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { AuthFacade } from '../../auth/store/auth.facade';
import { withWorkspace } from '../../core/features/with-workspace.feature';
import { TeamsFacade } from '../../teams/store/teams.facade';

export interface TeamDetailState {
  teamId: string | null;
}

const initialState: TeamDetailState = {
  teamId: null,
};

export const TeamDetailStore = signalStore(
  withState(initialState),
  withWorkspace(),
  withComputed((store) => {
    const authFacade = inject(AuthFacade);
    const teamsFacade = inject(TeamsFacade);

    const user = toSignal(authFacade.user$, { initialValue: null });
    const teams = toSignal(teamsFacade.teams$, { initialValue: [] });

    const team = computed<TeamDto | null>(() => {
      const id = store.teamId();
      const allTeams = teams();
      if (!id || !allTeams) return null;
      return allTeams.find((t) => t.id === id) || null;
    });

    const currentUserRole = computed<TeamRole | null>(() => {
      const t = team();
      const u = user();
      if (!t || !u) return null;
      const member = t.members.find((m) => m.userId === u.id);
      return member ? (member.role as TeamRole) : null;
    });

    const canManageTeam = computed<boolean>(() => {
      const role = currentUserRole();
      return role === TeamRole.OWNER || role === TeamRole.MANAGER;
    });

    return {
      user,
      teams,
      team,
      currentUserRole,
      canManageTeam,
    };
  }),
  withMethods((store) => {
    const teamsFacade = inject(TeamsFacade);

    return {
      setTeamId: (teamId: string) => {
        patchState(store, { teamId });
        if (teamId) {
          teamsFacade.loadTeam(teamId);
          store.loadWorkspaceContent(teamId);
        } else {
          store.clearWorkspaceContent();
        }
      },
      updateTeam: (id: string, data: UpdateTeamRequest) => {
        teamsFacade.updateTeam(id, data);
      },
      deleteTeam: (id: string) => {
        teamsFacade.deleteTeam(id);
      },
      inviteMember: (teamId: string, identifier: string) => {
        teamsFacade.addMember(teamId, { identifier, role: TeamRole.MEMBER });
      },
      updateMemberRole: (teamId: string, userId: string, role: TeamRole) => {
        teamsFacade.updateMemberRole(teamId, userId, { role });
      },
      removeMember: (teamId: string, userId: string) => {
        teamsFacade.removeMember(teamId, { targetUserId: userId });
      },
    };
  }),
  withHooks({
    onInit(store) {
      effect((onCleanup) => {
        const files = store.files();
        const team = store.team();
        const currentFolderId = store.currentFolder()?.resourceId;

        const hasProcessingFiles = files.some(
          (f) =>
            f.status === FileStatus.PROCESSING || f.status === FileStatus.UPLOADED || f.status === FileStatus.PENDING
        );

        if (hasProcessingFiles && team?.id) {
          const intervalId = setInterval(() => {
            store.pollWorkspaceContent(team.id, currentFolderId);
          }, 4000);

          onCleanup(() => {
            clearInterval(intervalId);
          });
        }
      });
    },
  })
);
