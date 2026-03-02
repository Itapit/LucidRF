import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamRepository } from './repository/team.repository';
import { TeamSchema, TeamSchemaFactory } from './repository/team.schema';
import { TeamMongoRepository } from './repository/mongo-team.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: TeamSchema.name, schema: TeamSchemaFactory }])],
  controllers: [TeamsController],
  providers: [TeamsService, { provide: TeamRepository, useClass: TeamMongoRepository }],
})
export class TeamsModule {}
