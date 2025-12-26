export abstract class PasswordService {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
  abstract generateTemporary(length?: number): string;
}
