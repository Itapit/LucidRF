import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS } from '../../../constants';
import { PasswordService } from '../../domain';

@Injectable()
export class BcryptPasswordService implements PasswordService {
  /**
   * Hashes a plain text password.
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
}
