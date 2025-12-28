import { AuthErrorCodes } from '../auth';
import { GroupErrorCodes } from '../groups';
import { UserErrorCodes } from '../users';
import { SystemErrorCodes } from './system-errors.codes';

export const AppErrorCodes = {
  ...AuthErrorCodes,
  ...UserErrorCodes,
  ...GroupErrorCodes,
  //   ...FileErrorCodes,
  ...SystemErrorCodes,
} as const;

export type AppErrorCode = (typeof AppErrorCodes)[keyof typeof AppErrorCodes];
