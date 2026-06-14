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
  ParseIntPipe,
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
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { CommitteesService } from './committees.service';
import { CloudinaryService } from '../../integrations/cloudinary/cloudinary.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { UpdateCommitteeByDirectorDto } from './dto/update-committee-by-director.dto';
import { Public } from '../../common/decorators/public.decorator';

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
  @Public()
  @ApiOperation({ summary: 'List all committees' })
  @ApiResponse({
    status: 200,
    description: 'List of all available committees.',
  })
  listAll() {
    return this.committeesService.listAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a specific committee by ID' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiResponse({ status: 200, description: 'The committee details.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  getById(@Param('id', ParseIntIdPipe) id: number) {
    return this.committeesService.getById(id);
  }

  // ── Executive ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.EXECUTIVE)
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
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
        image: {
          type: 'string',
          format: 'binary',
          description: 'Committee image (max 5 MB)',
        },
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

  /**
   * Update a committee's details.
   * Executives can use this endpoint to assign or update the directors for the committee
   * by providing an array of user IDs in the `directorIDs` field.
   */
  @Patch(':id')
  @Roles(Role.EXECUTIVE, Role.DIRECTOR)
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Update a committee (Executive: all fields | Director: description, whatsappGroupLink, image)',
  })
  @ApiParam({
    name: 'id',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Executive only' },
        description: { type: 'string' },
        type: {
          type: 'string',
          enum: ['TECHNICAL', 'MEDIA', 'OPERATION'],
          description: 'Executive only',
        },
        planID: { type: 'string', description: 'Executive only' },
        directorIDs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Executive only',
        },
        membersCount: { type: 'integer', description: 'Executive only' },
        whatsappGroupLink: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Committee image (max 5 MB)',
        },
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
  async update(
    @Param('id', ParseIntIdPipe) id: number,
    @Body() dto: UpdateCommitteeDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = req.user as AuthUser;

    if (user.role === Role.DIRECTOR) {
      const committee = await this.committeesService.getById(id);
      if (!committee.directorIDs.includes(user.id)) {
        throw new ForbiddenException('Director not assigned to this committee');
      }
      // Directors may only update these three fields
      const directorDto: UpdateCommitteeByDirectorDto = {
        description: dto.description,
        whatsappGroupLink: dto.whatsappGroupLink,
      };
      const imageUrl = image
        ? await this.cloudinaryService.uploadImage(image)
        : undefined;
      return this.committeesService.update(id, directorDto, imageUrl);
    }

    // Executive path — all fields allowed
    const imageUrl = image
      ? await this.cloudinaryService.uploadImage(image)
      : undefined;
    return this.committeesService.update(id, dto, imageUrl);
  }

  @Post(':id/assign-director')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Assign a director to a committee (Executive)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the committee',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'number',
          description: 'ID of the user to become director',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Director assigned successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires Executive role.',
  })
  @ApiResponse({ status: 404, description: 'Committee or User not found.' })
  async assignDirector(
    @Param('id', ParseIntIdPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.committeesService.assignDirector(id, userId);
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
  delete(@Param('id', ParseIntIdPipe) id: number) {
    return this.committeesService.delete(id);
  }
}
