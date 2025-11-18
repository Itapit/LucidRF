import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GROUP_CONFIG, GROUP_SERVICE } from './group-constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: GROUP_SERVICE,
        transport: Transport.TCP,
        options: {
          host: GROUP_CONFIG.HOST,
          port: GROUP_CONFIG.PORT,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GroupClientModule {}
