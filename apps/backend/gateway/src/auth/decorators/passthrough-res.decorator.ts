import { Res } from '@nestjs/common';

/**
 * Injects the Response object with 'passthrough: true' enabled.
 * This allows manual cookie handling while still letting NestJS handle the JSON response.
 */
export const PassthroughRes = () => Res({ passthrough: true });
