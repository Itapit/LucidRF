import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { SystemRole } from '@LucidRF/common';
import { filter, map, switchMap, take } from 'rxjs';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { AuthFacade } from '../../store/auth.facade';

export const adminGuard: CanMatchFn = () => {
  const authFacade = inject(AuthFacade);
  const nav = inject(NavigationService);

  return authFacade.loaded$.pipe(
    //  Wait for Auth Check
    filter((isInitialized) => isInitialized),
    take(1),

    // Check Role
    switchMap(() => authFacade.role$),

    // Decide
    map((role) => {
      if (role === SystemRole.ADMIN) {
        return true;
      }
      // Not an admin? Redirect to root.
      return nav.createRootUrlTree();
    })
  );
};
