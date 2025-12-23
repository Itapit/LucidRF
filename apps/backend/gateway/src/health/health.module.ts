import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { makeGaugeProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthController } from './health.controller';
import { HealthMonitor } from './health.monitor';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    TerminusModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    HealthMonitor,
    makeGaugeProvider({
      name: 'microservices_health',
      help: 'Health status of microservices (1 = up, 0 = down)',
      labelNames: ['service'],
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
