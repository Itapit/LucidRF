import { FILES_CONFIG } from '@LucidRF/files-contracts';
import { GROUPS_CONFIG } from '@LucidRF/groups-contracts';
import { USER_CONFIG } from '@LucidRF/users-contracts';
import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Local checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // 2. Check Users Microservice using shared constants
      () =>
        this.microservice.pingCheck('users_service', {
          transport: Transport.TCP,
          options: {
            host: USER_CONFIG.HOST,
            port: USER_CONFIG.PORT,
          },
        }),

      // 3. Check Groups Microservice using shared constants
      () =>
        this.microservice.pingCheck('groups_service', {
          transport: Transport.TCP,
          options: {
            host: GROUPS_CONFIG.HOST,
            port: GROUPS_CONFIG.PORT,
          },
        }),

      () =>
        this.microservice.pingCheck('files_service', {
          transport: Transport.TCP,
          options: {
            host: FILES_CONFIG.HOST,
            port: FILES_CONFIG.PORT,
          },
        }),
    ]);
  }
}
