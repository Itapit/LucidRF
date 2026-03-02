import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TEAMS_CONFIG, TEAMS_SERVICE } from './team-constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TEAMS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: TEAMS_CONFIG.HOST,
          port: TEAMS_CONFIG.PORT,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class TeamClientModule {}
