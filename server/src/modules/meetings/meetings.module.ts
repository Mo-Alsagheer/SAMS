import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { PlugnmeetModule } from '../../integrations/plugnmeet/plugnmeet.module';

@Module({
  imports: [PlugnmeetModule],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
