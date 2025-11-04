import { UserClientModule } from '@limbo/users-contracts';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [UserClientModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
