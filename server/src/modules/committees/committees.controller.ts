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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @Roles(Role.MEMBER, Role.DIRECTOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all committees' })
  @ApiResponse({ status: 200, description: 'List of all available committees.' })
  listAll() {
    return this.committeesService.listAll();
  }

  @Get(':id')
  @Roles(Role.MEMBER, Role.DIRECTOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'Get a specific committee by ID' })
  @ApiParam({ name: 'id', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 200, description: 'The committee details.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  getById(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.getById(id);
  }

  // ── Executive ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Create a new committee (Executive)' })
  @ApiResponse({ status: 201, description: 'The committee has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Executive role.' })
  create(@Body() dto: CreateCommitteeDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.committeesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Update a committee (Executive)' })
  @ApiParam({ name: 'id', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 200, description: 'The committee has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
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
  @ApiParam({ name: 'id', description: 'ULID of the committee to delete', example: '01HRGZ...' })
  @ApiResponse({ status: 204, description: 'The committee has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Cannot delete committee with an open recruitment process.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  delete(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.delete(id);
  }

  // ── Director ──────────────────────────────────────────────────────────────

  @Patch(':id/description')
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Update committee description (Director)' })
  @ApiParam({ name: 'id', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 200, description: 'The description was updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Director not assigned to committee.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
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
