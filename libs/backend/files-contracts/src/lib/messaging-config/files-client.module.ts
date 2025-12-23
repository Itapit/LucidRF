import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FILES_CONFIG, FILES_SERVICE } from './files-constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FILES_SERVICE,
        transport: Transport.TCP,
        options: {
          host: FILES_CONFIG.HOST,
          port: FILES_CONFIG.PORT,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class FilesClientModule {}
