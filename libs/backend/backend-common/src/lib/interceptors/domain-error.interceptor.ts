import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, Observable, throwError } from 'rxjs';
import { BaseDomainException } from '../exceptions';

@Injectable()
export class DomainErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DomainErrorInterceptor.name);

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        // Intercept Domain Exceptions -> Convert to RPC Standard
        if (error instanceof BaseDomainException) {
          this.logger.warn(`Domain Error: ${error.message} (Status: ${error.statusCode})`);

          return throwError(
            () =>
              new RpcException({
                statusCode: error.statusCode,
                message: error.message,
                error: error.constructor.name, // e.g. "InvalidTokenException"
                code: error.code,
              })
          );
        }

        // Pass through existing RPC Exceptions
        if (error instanceof RpcException) {
          return throwError(() => error);
        }

        // Catch unexpected crashes -> 500 Internal Server Error
        this.logger.error('Unexpected Error:', error);
        return throwError(
          () =>
            new RpcException({
              statusCode: 500,
              message: 'Internal Service Error',
              error: 'InternalServerError',
            })
        );
      })
    );
  }
}
