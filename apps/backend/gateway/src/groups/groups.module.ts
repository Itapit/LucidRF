import { GroupClientModule } from '@limbo/groups-contracts';
import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [GroupClientModule],
  providers: [GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
