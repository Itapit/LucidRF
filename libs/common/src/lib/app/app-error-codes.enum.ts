import { AuthErrorCodes } from '../auth';
import { TeamErrorCodes } from '../teams';
import { UserErrorCodes } from '../users';
import { SystemErrorCodes } from './system-errors.codes';

export const AppErrorCodes = {
  ...AuthErrorCodes,
  ...UserErrorCodes,
  ...TeamErrorCodes,
  //   ...FileErrorCodes,
  ...SystemErrorCodes,
} as const;

export type AppErrorCode = (typeof AppErrorCodes)[keyof typeof AppErrorCodes];
