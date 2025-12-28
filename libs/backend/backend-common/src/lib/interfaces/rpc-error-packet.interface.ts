import { AppErrorCode } from '@LucidRF/common';

export interface RpcErrorPacket {
  statusCode: number | string;
  message: string;
  code: string | AppErrorCode;
  error?: string;
}
