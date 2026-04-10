export enum AppRoute {
  ROOT = '',

  // Top Level
  AUTH = 'auth',
  ADMIN = 'admin',
  HOME = 'home',
  WORKSPACE = 'workspace',
  TEAMS = 'teams',
  NOT_FOUND = '**',

  // Children of Auth
  LOGIN = 'login',
  COMPLETE_SETUP = 'complete-setup',

  // Children of Admin
  ADMIN_USERS = 'users',
  ADMIN_MONITORING = 'monitoring',
}

// Helper to construct full paths for use in Services/Effects
export const AppPaths = {
  root: `/${AppRoute.ROOT}`,
  home: `/${AppRoute.HOME}`,
  workspace: `/${AppRoute.WORKSPACE}`,
  teams: `/${AppRoute.TEAMS}`,
  auth: {
    login: `/${AppRoute.AUTH}/${AppRoute.LOGIN}`,
    completeSetup: `/${AppRoute.AUTH}/${AppRoute.COMPLETE_SETUP}`,
  },
  admin: {
    root: `/${AppRoute.ADMIN}`,
    users: `/${AppRoute.ADMIN}/${AppRoute.ADMIN_USERS}`,
    monitoring: `/${AppRoute.ADMIN}/${AppRoute.ADMIN_MONITORING}`,
  },
};
