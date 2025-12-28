/* eslint-disable @typescript-eslint/no-explicit-any */

import { RpcErrorPacket } from '../interfaces';

/**
 * Type Guard to safely check if an object is an RpcErrorPacket.
 * Usage: if (isRpcErrorPacket(error)) { ... }
 */
export function isRpcErrorPacket(obj: any): obj is RpcErrorPacket {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (typeof obj.statusCode === 'number' || typeof obj.statusCode === 'string') &&
    typeof obj.message === 'string' &&
    (typeof obj.code === 'string' || typeof obj.code === 'number')
  );
}
