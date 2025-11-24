import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { AppPaths } from '../../../core/navigation/app-routes.enum';
import { AuthFacade } from '../../store/auth.facade';

export const loggedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  return authFacade.isInitialized$.pipe(
    // Wait until the App Init (Refresh -> LoadMe) is done.
    filter((isInitialized) => isInitialized),

    // Once initialized, take the first result and proceed.
    take(1),

    // CHECK: Switch to the login status.
    switchMap(() => authFacade.isLoggedIn$),

    // DECIDE: Allow access or redirect.
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true;
      }
      // Redirect to login if not authenticated
      return router.createUrlTree([AppPaths.auth.login]);
    })
  );
};
