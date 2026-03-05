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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '../../common/constants/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDescriptionDto } from './dto/update-committee-description.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@ApiTags('committees')
@ApiBearerAuth()
@Controller('committees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  // ── Shared ────────────────────────────────────────────────────────────────

  @Get()
  @Roles(Role.USER, Role.DIRECTOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all committees' })
  listAll() {
    return this.committeesService.listAll();
  }

  @Get(':id')
  @Roles(Role.USER, Role.DIRECTOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'Get committee by ID' })
  getById(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.getById(id);
  }

  // ── Executive ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Create a new committee (Executive)' })
  create(@Body() dto: CreateCommitteeDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.committeesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Update a committee (Executive)' })
  update(
    @Param('id', new ParseUlidPipe()) id: string,
    @Body() dto: UpdateCommitteeDto,
  ) {
    return this.committeesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.EXECUTIVE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a committee (Executive)' })
  delete(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.delete(id);
  }

  // ── Director ──────────────────────────────────────────────────────────────

  @Patch(':id/description')
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Update committee description (Director)' })
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
