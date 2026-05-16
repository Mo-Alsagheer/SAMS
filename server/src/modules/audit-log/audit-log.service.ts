import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  private redact(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;
    const redacted = Array.isArray(obj) ? [] : {};
    const blacklist = ['password', 'token', 'authorization', 'accessToken'];
    for (const key of Object.keys(obj)) {
      if (blacklist.includes(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
        continue;
      }
      const val = obj[key];
      redacted[key] = typeof val === 'object' ? this.redact(val) : val;
    }
    return redacted;
  }

  async log(entry: Partial<AuditLog>) {
    const toSave: Partial<AuditLog> = {
      ...entry,
      params: this.redact(entry.params),
      query: this.redact(entry.query),
      body: this.redact(entry.body),
    };
    return this.repo.save(this.repo.create(toSave as AuditLog));
  }
}
