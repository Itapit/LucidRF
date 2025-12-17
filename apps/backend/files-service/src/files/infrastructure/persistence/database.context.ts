import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ClientSession } from 'mongoose';

@Injectable()
export class DatabaseContext {
  private readonly storage = new AsyncLocalStorage<ClientSession>();

  /**
   * Runs a callback within a specific session context.
   */
  runWithSession<T>(session: ClientSession, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(session, callback);
  }

  /**
   * Retrieves the current active session, if any.
   */
  getSession(): ClientSession | null {
    return this.storage.getStore() || null;
  }
}
