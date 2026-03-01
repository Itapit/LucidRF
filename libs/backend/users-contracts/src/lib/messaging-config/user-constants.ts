export const USER_SERVICE = 'USERS_SERVICE';

export const USER_CONFIG = {
  PORT: 3001,
  HOST: 'localhost',
};

export const USER_PATTERNS = {
  CREATE_USER: 'user:create_user',
  GET_USER_BY_ID: 'user:get_user_by_id',
  GET_USERS_BY_IDS: 'user:get_users_by_ids',
  AUTH_LOGIN: 'user:auth_login',
  AUTH_COMPLETE_SETUP: 'user:auth_complete_setup',
  AUTH_REFRESH: 'user:auth_refresh',
  AUTH_LOGOUT: 'user:auth_logout',
  AUTH_LOGOUT_ALL: 'user:auth_logout_all',
};
