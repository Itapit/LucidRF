import { FILES_CONFIG } from '@LucidRF/files-contracts';
import { TEAMS_CONFIG } from '@LucidRF/teams-contracts';
import { USER_CONFIG } from '@LucidRF/users-contracts';
import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { MAX_MEMORY_HEAP_BYTES } from './health.constants';

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
      () => this.memory.checkHeap('memory_heap', MAX_MEMORY_HEAP_BYTES),

      // Check Users Microservice using shared constants
      () =>
        this.microservice.pingCheck('users_service', {
          transport: Transport.TCP,
          options: {
            host: USER_CONFIG.HOST,
            port: USER_CONFIG.PORT,
          },
        }),

      // Check Teams Microservice using shared constants
      () =>
        this.microservice.pingCheck('teams_service', {
          transport: Transport.TCP,
          options: {
            host: TEAMS_CONFIG.HOST,
            port: TEAMS_CONFIG.PORT,
          },
        }),

      // Check Files Microservice using shared constants
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
