export const FILES_SERVICE = 'FILES_SERVICE';

export const FILES_CONFIG = {
  PORT: 3003,
  HOST: 'localhost',
};

export const FILES_PATTERNS = {
  // File Lifecycle
  INIT_UPLOAD: 'files.init_upload',
  CONFIRM_UPLOAD: 'files.confirm_upload',
  DELETE_FILE: 'files.delete_file',
  GET_DOWNLOAD_URL: 'files.get_download_url',

  // Folder Management
  CREATE_FOLDER: 'files.create_folder',
  LIST_CONTENT: 'files.list_content',
  DELETE_FOLDER: 'files.delete_folder',

  // Sharing & ACL
  GET_SHARED_FILES: 'files.get_shared_with_me',
  SHARE_FILE: 'files.share_file',
  UNSHARE_FILE: 'files.unshare_file',
  SHARE_FOLDER: 'files.share_folder',
  UNSHARE_FOLDER: 'files.unshare_folder',
};
