import { GroupClientModule } from '@LucidRF/groups-contracts';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { GROUPS_CACHE_MAX, GROUPS_CACHE_TTL } from './groups.constants';
import { TcpGroupsService } from './tcp-groups.service';

@Module({
  imports: [
    GroupClientModule,
    CacheModule.register({
      ttl: GROUPS_CACHE_TTL,
      max: GROUPS_CACHE_MAX,
    }),
  ],
  providers: [TcpGroupsService],
  exports: [TcpGroupsService],
})
export class GroupsIntegrationModule {}
