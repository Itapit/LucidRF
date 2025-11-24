import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { AppPaths } from '../../../core/navigation/app-routes.enum';
import { AuthFacade } from '../../store/auth.facade';

export const loggedOutGuard: CanActivateFn = () => {
  const router = inject(Router);
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
        return router.createUrlTree([AppPaths.dashboard]);
      }

      // If user is NOT logged in, they are allowed to view the Login page.
      return true;
    })
  );
};
