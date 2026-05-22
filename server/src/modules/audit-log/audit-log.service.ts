import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

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

    // Print to console so developers can see it happening live
    this.logger.log(
      `[AUDIT] Action: ${toSave.action} | UserID: ${toSave.userId || 'Guest'} | Path: ${toSave.path || 'N/A'}`,
    );

    return this.repo.save(this.repo.create(toSave as AuditLog));
  }

  async findAll(
    options: { page?: number; limit?: number; filter?: Partial<AuditLog> } = {},
  ) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit =
      options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.filter) {
      // only copy primitive filters (action, userId, userRole, path)
      const allowed = ['action', 'userId', 'userRole', 'path'];
      for (const k of allowed) {
        if ((options.filter as any)[k]) where[k] = (options.filter as any)[k];
      }
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }
}
