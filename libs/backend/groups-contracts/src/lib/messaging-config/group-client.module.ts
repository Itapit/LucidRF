import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GROUPS_CONFIG, GROUPS_SERVICE } from './group-constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: GROUPS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: GROUPS_CONFIG.HOST,
          port: GROUPS_CONFIG.PORT,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GroupClientModule {}
