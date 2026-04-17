import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NotificationsClientService } from './notifications-client.service';

@Module({
  imports: [HttpModule],
  providers: [NotificationsClientService],
  exports: [NotificationsClientService],
})
export class NotificationsModule {}
