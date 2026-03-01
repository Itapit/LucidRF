import { TeamDto } from '@LucidRF/common';
import { TEAMS_PATTERNS, TEAMS_SERVICE } from '@LucidRF/teams-contracts';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';
import { TeamsService } from '../../files/domain/interfaces';
import { TEAMS_CACHE_PREFIX, TEAMS_REQUEST_TIMEOUT } from './teams.constants';

@Injectable()
export class TcpTeamsService implements TeamsService {
  private readonly logger = new Logger(TcpTeamsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(TEAMS_SERVICE) private readonly client: ClientProxy
  ) {}

  async getUserTeamIds(userId: string): Promise<string[]> {
    const cacheKey = `${TEAMS_CACHE_PREFIX}:${userId}`;

    const cached = await this.cacheManager.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const teams = await firstValueFrom(
        this.client.send<TeamDto[]>(TEAMS_PATTERNS.GET_USER_TEAMS, userId).pipe(timeout(TEAMS_REQUEST_TIMEOUT))
      );
      const teamIds = teams?.map((t) => t.id) || [];

      await this.cacheManager.set(cacheKey, teamIds);

      return teamIds;
    } catch (error) {
      this.logger.error(`Failed to fetch teams for user ${userId}`, error);
      return [];
    }
  }
}
