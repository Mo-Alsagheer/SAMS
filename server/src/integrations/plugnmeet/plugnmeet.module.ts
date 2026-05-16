import { Module } from '@nestjs/common';
import { PlugnmeetService } from './plugnmeet.service';

@Module({
  providers: [PlugnmeetService],
  exports: [PlugnmeetService],
})
export class PlugnmeetModule {}
