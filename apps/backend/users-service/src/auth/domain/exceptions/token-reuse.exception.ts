export class TokenReuseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenReuseException';
  }
}
