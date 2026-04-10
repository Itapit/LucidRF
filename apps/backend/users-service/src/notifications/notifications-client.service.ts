import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, retry, timer } from 'rxjs';
import { NotificationInternalPath } from './notification-internal-path.enum';

@Injectable()
export class NotificationsClientService {
  private readonly logger = new Logger(NotificationsClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Best-effort: does not throw. Skips when NOTIFICATIONS_SERVICE_BASE_URL is unset.
   */
  async sendWelcomePendingUserEmail(params: {
    email: string;
    username: string;
    temporaryPassword: string;
  }): Promise<void> {
    const baseUrl = this.configService.get<string>('NOTIFICATIONS_SERVICE_BASE_URL')?.trim();
    if (!baseUrl) {
      return;
    }
    const apiKey = this.configService.get<string>('NOTIFICATIONS_INTERNAL_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'NOTIFICATIONS_SERVICE_BASE_URL is set but NOTIFICATIONS_INTERNAL_API_KEY is missing; skipping welcome email'
      );
      return;
    }
    const url = `${baseUrl.replace(/\/+$/, '')}${NotificationInternalPath.WELCOME_PENDING_USER}`;
    try {
      await firstValueFrom(
        this.httpService
          .post(url, params, {
            headers: { 'X-Internal-Api-Key': apiKey },
            timeout: 30_000,
          })
          .pipe(
            // Handle short-lived network hiccups without delaying user creation.
            retry({
              count: 2,
              delay: (_error, retryCount) => timer(retryCount * 500),
            })
          )
      );
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${params.email}`, err);
    }
  }
}
