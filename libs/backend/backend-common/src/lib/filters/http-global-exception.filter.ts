import { ApiErrorResponse, AppErrorCodes } from '@LucidRF/common';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { RpcErrorPacket } from '../interfaces';
import { isRpcErrorPacket } from '../utils';

const DEFAULT_ERROR_MESSAGE = 'Internal server error';

@Catch()
export class HttpGlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpGlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (!response || typeof response.status !== 'function') {
      return;
    }

    const { statusCode, message, code } = this.resolveErrorDetails(exception);

    const errorResponse: ApiErrorResponse = {
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (statusCode >= 500) {
      this.logger.error(`[${code}] ${message}`, exception);
    }

    response.status(statusCode).json(errorResponse);
  }

  // --- Private Helpers ---

  private resolveErrorDetails(exception: unknown): { statusCode: number; message: string; code: string } {
    const rpcPacket = this.extractRpcPacket(exception);
    if (rpcPacket) {
      return {
        statusCode: Number(rpcPacket.statusCode),
        message: rpcPacket.message,
        code: String(rpcPacket.code),
      };
    }

    // Standard HTTP Exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = exception.getResponse() as any;
      return {
        statusCode: status,
        message: Array.isArray(res.message) ? res.message.join(', ') : res.message || exception.message,
        code: res.code || AppErrorCodes.BAD_REQUEST,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception instanceof Error ? exception.message : DEFAULT_ERROR_MESSAGE,
      code: AppErrorCodes.INTERNAL_ERROR,
    };
  }

  /**
   * Extracts the packet from raw objects, RpcExceptions, or Nested Wrappers
   */
  private extractRpcPacket(exception: unknown): RpcErrorPacket | null {
    let data = exception;
    if (exception instanceof RpcException) {
      data = exception.getError();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = data as any;

    if (!obj || typeof obj !== 'object') return null;

    // Direct Match
    if (isRpcErrorPacket(obj)) return obj;

    // Nested Match (The fix for your logs)
    if (obj.error && isRpcErrorPacket(obj.error)) return obj.error;

    return null;
  }
}
