import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ParseUlidPipe } from '../common/pipes/parse-ulid.pipe';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDescriptionDto } from './dto/update-committee-description.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@Controller('committees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  // ── Shared ────────────────────────────────────────────────────────────────

  @Get()
  @Roles(Role.USER, Role.DIRECTOR, Role.EXECUTIVE)
  listAll() {
    return this.committeesService.listAll();
  }

  @Get(':id')
  @Roles(Role.USER, Role.DIRECTOR, Role.EXECUTIVE)
  getById(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.getById(id);
  }

  // ── Executive ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.EXECUTIVE)
  create(@Body() dto: CreateCommitteeDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.committeesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.EXECUTIVE)
  update(
    @Param('id', new ParseUlidPipe()) id: string,
    @Body() dto: UpdateCommitteeDto,
  ) {
    return this.committeesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.EXECUTIVE)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.delete(id);
  }

  // ── Director ──────────────────────────────────────────────────────────────

  @Patch(':id/description')
  @Roles(Role.DIRECTOR)
  async updateDescription(
    @Param('id', new ParseUlidPipe()) id: string,
    @Body() dto: UpdateCommitteeDescriptionDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    const committee = await this.committeesService.getById(id);
    if (!committee.directorIDs.includes(user.id)) {
      throw new ForbiddenException('Director not assigned to committee');
    }
    return this.committeesService.updateDescription(id, dto.description);
  }
}
