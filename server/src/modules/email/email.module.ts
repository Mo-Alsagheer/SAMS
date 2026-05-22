import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EmailController } from './email.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, AuditLogModule, UsersModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
