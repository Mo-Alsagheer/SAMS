import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('committees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.DIRECTOR, Role.EXECUTIVE)
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  listAll() {
    return this.committeesService.listAll();
  }

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.committeesService.getById(id);
  }
}
