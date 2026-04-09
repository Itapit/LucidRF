export const USER_SERVICE = 'USERS_SERVICE';

export const USER_CONFIG = {
  PORT: 3001,
  HOST: 'localhost',
};

export const USER_PATTERNS = {
  CREATE_USER: 'user:create_user',
  GET_ALL_USERS: 'user:get_all_users',
  GET_USER_BY_ID: 'user:get_user_by_id',
  GET_USER_BY_IDENTIFIER: 'user:get_user_by_identifier',
  GET_USERS_BY_IDS: 'user:get_users_by_ids',
  DELETE_USER: 'user:delete_user',
  AUTH_LOGIN: 'user:auth_login',
  AUTH_COMPLETE_SETUP: 'user:auth_complete_setup',
  AUTH_REFRESH: 'user:auth_refresh',
  AUTH_LOGOUT: 'user:auth_logout',
  AUTH_LOGOUT_ALL: 'user:auth_logout_all',
};
