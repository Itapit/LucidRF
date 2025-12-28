import { AppErrorCode } from './app-error-codes.enum';

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  code: string | AppErrorCode;
  timestamp: string;
  path?: string;
}
