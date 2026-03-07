import { FilesClientModule } from '@LucidRF/files-contracts';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMongoRepository } from './repository/mongo-team.repository';
import { TeamRepository } from './repository/team.repository';
import { TeamSchema, TeamSchemaFactory } from './repository/team.schema';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: TeamSchema.name, schema: TeamSchemaFactory }]), FilesClientModule],
  controllers: [TeamsController],
  providers: [TeamsService, { provide: TeamRepository, useClass: TeamMongoRepository }],
})
export class TeamsModule {}
