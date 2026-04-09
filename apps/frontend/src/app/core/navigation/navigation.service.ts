import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AppPaths } from './app-routes.enum';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  toHome(): void {
    this.router.navigate([AppPaths.home]);
  }

  toWorkspace(): void {
    this.router.navigate([AppPaths.workspace]);
  }

  toTeam(teamId: string): void {
    this.router.navigate([AppPaths.teams, teamId]);
  }

  toAdmin(): void {
    this.toAdminUsers();
  }

  toAdminUsers(): void {
    this.router.navigate([AppPaths.admin.users]);
  }

  toAdminSettings(): void {
    this.router.navigate([AppPaths.admin.settings]);
  }

  isActiveAdminTab(tab: 'users' | 'settings'): boolean {
    return this.router.url.includes(AppPaths.admin[tab]);
  }

  toLogin(): void {
    this.router.navigate([AppPaths.auth.login]);
  }

  toCompleteSetup(token?: string): void {
    const commands = [AppPaths.auth.completeSetup];
    const extras = token ? { queryParams: { token } } : {};
    this.router.navigate(commands, extras);
  }

  toRoot(): void {
    this.router.navigate(['/']);
  }

  // --- Guard Helpers (UrlTree) ---
  // These are used by Guards to redirect without side effects

  public createLoginUrlTree(): UrlTree {
    return this.router.createUrlTree([AppPaths.auth.login]);
  }

  public createHomeUrlTree(): UrlTree {
    return this.router.createUrlTree([AppPaths.home]);
  }

  public createRootUrlTree(): UrlTree {
    return this.router.createUrlTree(['/']);
  }
}
