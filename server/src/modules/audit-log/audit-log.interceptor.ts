import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, body, params, query, headers } = req;
    const user = req.user || {};
    const entryBase = {
      action: `${method} ${originalUrl}`,
      method,
      path: originalUrl,
      params,
      query,
      body,
      userId: user?.id ?? null,
      userRole: user?.role ?? null,
      ipAddress: req.ip ?? headers['x-forwarded-for'] ?? null,
      userAgent: headers['user-agent'] ?? null,
    } as any;

    return next.handle().pipe(
      tap({
        next: (res) => {
          this.audit.log({
            ...entryBase,
            statusCode: context.switchToHttp().getResponse().statusCode,
          }).catch(() => undefined);
        },
      }),
    );
  }
}
