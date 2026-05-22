import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXECUTIVE)
@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(private readonly audit: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs (paginated) — admin only' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'userRole', required: false })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('userRole') userRole?: string,
  ) {
    const p = page ? Number(page) : undefined;
    const l = limit ? Number(limit) : undefined;
    const filter: any = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (userRole) filter.userRole = userRole;

    return this.audit.findAll({ page: p, limit: l, filter });
  }
}
