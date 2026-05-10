import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { HASH_ROUNDS } from '../constants';
import { PasswordService } from '../interfaces';

@Injectable()
export class BcryptPasswordService implements PasswordService {
  /**
   * Hashes a plain text password.
   * Note: bcrypt.hash automatically generates and includes the salt in the resulting hash string.
   */
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, HASH_ROUNDS);
  }

  /**
   * Compares a plain text password with a hash.
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  /**
   * Generates a temporary password of specified length.
   */
  generateTemporary(length = 12): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}
