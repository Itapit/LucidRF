import { HttpStatus } from '@nestjs/common';

export abstract class BaseDomainException extends Error {
  /**
   * @param message User-friendly error message
   * @param statusCode The HTTP status this error should map to (default: 400)
   * @param code Optional internal error code (e.g. "AUTH_001")
   */
  constructor(
    override readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'BaseDomainException';
  }
}
