import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [ConfigModule, AuditLogModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
