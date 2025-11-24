import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupRepository } from './repository/group.repository';
import { GroupSchema, GroupSchemaFactory } from './repository/group.schema';
import { GroupMongoRepository } from './repository/mongo-group.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: GroupSchema.name, schema: GroupSchemaFactory }])],
  controllers: [GroupsController],
  providers: [GroupsService, { provide: GroupRepository, useClass: GroupMongoRepository }],
})
export class GroupsModule {}
