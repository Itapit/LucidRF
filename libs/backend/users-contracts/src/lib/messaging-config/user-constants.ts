export const USER_SERVICE = 'USERS_SERVICE';

export const USER_CONFIG = {
  PORT: 3001,
  HOST: 'localhost',
};

export const USER_PATTERNS = {
  CREATE_USER: 'cmd:create_user',
  GET_USER_BY_ID: 'cmd:get_user_by_id',
  PING: 'cmd:ping',
  AUTH_LOGIN: 'cmd:auth_login',
  AUTH_COMPLETE_SETUP: 'cmd:auth_complete_setup',
  AUTH_REFRESH: 'cmd:auth_refresh',
};
