import { AppErrorCodes } from '@LucidRF/common';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { BaseDomainException } from '../exceptions';
import { RpcErrorPacket } from '../interfaces';

@Catch(BaseDomainException)
export class RpcDomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcDomainExceptionFilter.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: BaseDomainException, _host: ArgumentsHost): Observable<unknown> {
    this.logger.warn(`Business Error: [${exception.code}] ${exception.message}`);

    const packet: RpcErrorPacket = {
      statusCode: exception.statusCode,
      message: exception.message,
      code: exception.code || AppErrorCodes.INTERNAL_ERROR,
      error: exception.constructor.name,
    };

    return throwError(() => new RpcException(packet));
  }
}
