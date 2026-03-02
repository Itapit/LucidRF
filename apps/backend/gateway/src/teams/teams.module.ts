import { TeamClientModule } from '@LucidRF/teams-contracts';
import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [TeamClientModule],
  providers: [TeamsService],
  controllers: [TeamsController],
})
export class TeamsModule {}
