import { FILES_CONFIG } from '@LucidRF/files-contracts';
import { TEAMS_CONFIG } from '@LucidRF/teams-contracts';
import { USER_CONFIG } from '@LucidRF/users-contracts';
import { Injectable } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import {
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { MAX_MEMORY_HEAP_BYTES } from './health.constants';

@Injectable()
export class HealthMonitor {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private memory: MemoryHealthIndicator,
    @InjectMetric('microservices_health') public healthGauge: Gauge<string>
  ) {}

  @Cron('*/10 * * * * *')
  async updateHeartbeat() {
    try {
      // Run the checks (Used 'memory' here to fix unused var warning)
      await this.health.check([
        () => this.memory.checkHeap('memory_heap', MAX_MEMORY_HEAP_BYTES),
        () =>
          this.microservice.pingCheck('users_service', {
            transport: Transport.TCP,
            options: { host: USER_CONFIG.HOST, port: USER_CONFIG.PORT },
          }),
        () =>
          this.microservice.pingCheck('teams_service', {
            transport: Transport.TCP,
            options: { host: TEAMS_CONFIG.HOST, port: TEAMS_CONFIG.PORT },
          }),
        () =>
          this.microservice.pingCheck('files_service', {
            transport: Transport.TCP,
            options: { host: FILES_CONFIG.HOST, port: FILES_CONFIG.PORT },
          }),
      ]);

      // If we reach here, everything is OK
      this.updateGauge('users_service', 1);
      this.updateGauge('teams_service', 1);
      this.updateGauge('files_service', 1);
    } catch (error: unknown) {
      // Safe cast to access the response details
      const healthError = error as { response?: HealthCheckResult };
      const details = healthError?.response?.details;

      if (details) {
        // Update gauges based on the partial results
        this.updateGauge('users_service', details['users_service']?.status === 'up' ? 1 : 0);
        this.updateGauge('teams_service', details['teams_service']?.status === 'up' ? 1 : 0);
        this.updateGauge('files_service', details['files_service']?.status === 'up' ? 1 : 0);
      }
    }
  }

  private updateGauge(service: string, status: number) {
    this.healthGauge.set({ service }, status);
  }
}
