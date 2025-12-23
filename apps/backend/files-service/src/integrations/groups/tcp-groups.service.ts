import { GroupDto } from '@LucidRF/common';
import { GROUPS_PATTERNS, GROUPS_SERVICE } from '@LucidRF/groups-contracts';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';
import { GroupsService } from '../../files/domain/interfaces';
import { GROUPS_CACHE_PREFIX, GROUPS_REQUEST_TIMEOUT } from './groups.constants';

@Injectable()
export class TcpGroupsService implements GroupsService {
  private readonly logger = new Logger(TcpGroupsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(GROUPS_SERVICE) private readonly client: ClientProxy
  ) {}

  async getUserGroupIds(userId: string): Promise<string[]> {
    const cacheKey = `${GROUPS_CACHE_PREFIX}:${userId}`;

    const cached = await this.cacheManager.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const groups = await firstValueFrom(
        this.client.send<GroupDto[]>(GROUPS_PATTERNS.GET_USER_GROUPS, userId).pipe(timeout(GROUPS_REQUEST_TIMEOUT))
      );
      const groupIds = groups?.map((g) => g.id) || [];

      await this.cacheManager.set(cacheKey, groupIds);

      return groupIds;
    } catch (error) {
      this.logger.error(`Failed to fetch groups for user ${userId}`, error);
      return [];
    }
  }
}
