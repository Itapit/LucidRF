import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { AuthFacade } from '../../store/auth.facade';

export const loggedOutGuard: CanActivateFn = () => {
  const nav = inject(NavigationService);
  const authFacade = inject(AuthFacade);

  return authFacade.isInitialized$.pipe(
    // Wait for the App Init (Refresh Token Check) to finish
    filter((isInitialized) => isInitialized),
    take(1),
    // Are we logged in?
    switchMap(() => authFacade.isLoggedIn$),

    map((isLoggedIn) => {
      // If user IS logged in, they shouldn't be here. Send to Dashboard.
      if (isLoggedIn) {
        return nav.createDashboardUrlTree();
      }

      // If user is NOT logged in, they are allowed to view the Login page.
      return true;
    })
  );
};
