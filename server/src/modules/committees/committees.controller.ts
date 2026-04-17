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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '../../common/constants/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CommitteesService } from './committees.service';
import { CloudinaryService } from '../../integrations/cloudinary/cloudinary.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDescriptionDto } from './dto/update-committee-description.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { UpdateCommitteeByDirectorDto } from './dto/update-committee-by-director.dto';

@ApiTags('committees')
@ApiBearerAuth()
@Controller('committees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommitteesController {
  constructor(
    private readonly committeesService: CommitteesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ── Shared ────────────────────────────────────────────────────────────────

  @Get()
  @Roles(Role.MEMBER, Role.DIRECTOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all committees' })
  @ApiResponse({
    status: 200,
    description: 'List of all available committees.',
  })
  listAll() {
    return this.committeesService.listAll();
  }

  @Get(':id')
  @Roles(Role.MEMBER, Role.DIRECTOR, Role.EXECUTIVE)
  @ApiOperation({ summary: 'Get a specific committee by ID' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiResponse({ status: 200, description: 'The committee details.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  getById(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.getById(id);
  }

  // ── Executive ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.EXECUTIVE)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new committee (Executive)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string', example: 'Technical Committee' },
        description: { type: 'string' },
        type: { type: 'string', enum: ['TECHNICAL', 'MEDIA', 'HR', 'EX-COMM'] },
        planID: { type: 'string' },
        directorIDs: { type: 'array', items: { type: 'string' } },
        membersCount: { type: 'integer' },
        whatsappGroupLink: { type: 'string' },
        image: { type: 'string', format: 'binary', description: 'Committee image (max 5 MB)' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The committee has been successfully created.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires Executive role.',
  })
  async create(
    @Body() dto: CreateCommitteeDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = req.user as AuthUser;
    const imageUrl = image
      ? await this.cloudinaryService.uploadImage(image)
      : undefined;
    return this.committeesService.create(dto, user.id, imageUrl);
  }

  @Patch(':id')
  @Roles(Role.EXECUTIVE)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a committee (Executive)' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: ['TECHNICAL', 'MEDIA', 'HR', 'EX-COMM'] },
        planID: { type: 'string' },
        directorIDs: { type: 'array', items: { type: 'string' } },
        membersCount: { type: 'integer' },
        whatsappGroupLink: { type: 'string' },
        image: { type: 'string', format: 'binary', description: 'Committee image (max 5 MB)' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The committee has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  async update(
    @Param('id', new ParseUlidPipe()) id: string,
    @Body() dto: UpdateCommitteeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageUrl = image
      ? await this.cloudinaryService.uploadImage(image)
      : undefined;
    return this.committeesService.update(id, dto, imageUrl);
  }

  @Delete(':id')
  @Roles(Role.EXECUTIVE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a committee (Executive)' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee to delete',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 204,
    description: 'The committee has been successfully deleted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete committee with an open recruitment process.',
  })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  delete(@Param('id', new ParseUlidPipe()) id: string) {
    return this.committeesService.delete(id);
  }

  // ── Director ──────────────────────────────────────────────────────────────

  @Patch(':id/description')
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Update committee description (Director)' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiResponse({ status: 200, description: 'The description was updated.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Director not assigned to committee.',
  })
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

  @Patch(':id')
  @Roles(Role.DIRECTOR)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update committee details (Director)' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        whatsappGroupLink: { type: 'string' },
        image: { type: 'string', format: 'binary', description: 'Committee image (max 5 MB)' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The committee has been successfully updated.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Director not assigned to this committee.',
  })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  async updateByDirector(
    @Param('id', new ParseUlidPipe()) id: string,
    @Body() dto: UpdateCommitteeByDirectorDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = req.user as AuthUser;
    const committee = await this.committeesService.getById(id);
    if (!committee.directorIDs.includes(user.id)) {
      throw new ForbiddenException('Director not assigned to this committee');
    }
    const imageUrl = image
      ? await this.cloudinaryService.uploadImage(image)
      : undefined;
    return this.committeesService.update(id, dto, imageUrl);
  }
}
