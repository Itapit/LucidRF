import { TeamClientModule } from '@LucidRF/teams-contracts';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TcpTeamsService } from './tcp-teams.service';
import { TEAMS_CACHE_MAX, TEAMS_CACHE_TTL } from './teams.constants';

@Module({
  imports: [
    TeamClientModule,
    CacheModule.register({
      ttl: TEAMS_CACHE_TTL,
      max: TEAMS_CACHE_MAX,
    }),
  ],
  providers: [TcpTeamsService],
  exports: [TcpTeamsService],
})
export class TeamsIntegrationModule {}
