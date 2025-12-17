import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TransactionManager } from '../../domain/transaction.manager';
import { DatabaseContext } from './database.context';

@Injectable()
export class MongoTransactionManager implements TransactionManager {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly dbContext: DatabaseContext
  ) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Execute the function inside the AsyncLocalStorage context
      const result = await this.dbContext.runWithSession(session, fn);

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
