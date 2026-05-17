import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { PlugnmeetModule } from '../../integrations/plugnmeet/plugnmeet.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PlugnmeetModule, AuditLogModule],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
