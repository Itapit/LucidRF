import { GroupClientModule } from '@LucidRF/groups-contracts';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TcpGroupsService } from './tcp-groups.service';

@Module({
  imports: [
    GroupClientModule,
    CacheModule.register({
      ttl: 300000, //TODO fix magic number
      max: 1000,
    }),
  ],
  providers: [TcpGroupsService],
  exports: [TcpGroupsService],
})
export class GroupsIntegrationModule {}
