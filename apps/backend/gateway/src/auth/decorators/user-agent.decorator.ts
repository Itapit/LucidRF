import { Headers } from '@nestjs/common';
import { HEADER_USER_AGENT } from '../constants';

/**
 * Extracts the User-Agent header using the defined constant.
 */
export const UserAgent = () => Headers(HEADER_USER_AGENT);
