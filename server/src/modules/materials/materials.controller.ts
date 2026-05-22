import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { AuthUser } from '../auth/auth.types';
import { CloudinaryService } from '../../integrations/cloudinary/cloudinary.service';

@ApiTags('materials')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller()
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Get('sessions/:sessionId/materials')
  @ApiOperation({ summary: 'List materials for a session' })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiResponse({ status: 200, description: 'Materials returned.' })
  listBySession(@Param('sessionId', ParseIntIdPipe) sessionId: number) {
    return this.materialsService.findBySession(sessionId);
  }

  @Get('committees/:committeeId/materials')
  @ApiOperation({ summary: 'List all materials for a committee' })
  @ApiParam({ name: 'committeeId', description: 'Numeric committee ID' })
  @ApiResponse({ status: 200, description: 'Materials returned.' })
  listByCommittee(@Param('committeeId', ParseIntIdPipe) committeeId: number) {
    return this.materialsService.findByCommittee(committeeId);
  }

  @Post('director/sessions/:sessionId/materials')
  // @UseGuards(RolesGuard)
  // @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Upload or attach a material to a session' })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'Material created.' })
  async create(
    @Param('sessionId', ParseIntIdPipe) sessionId: number,
    @Body() dto: CreateMaterialDto,
    @Req() req: Request & { user?: AuthUser },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileUrl: string | undefined;
    if (file) {
      fileUrl = await this.cloudinaryService.uploadFile(
        file,
        'Session_Materials',
      );
    }
    return this.materialsService.createForSession(
      sessionId,
      dto,
      fileUrl,
      req.user?.id || 1,
    );
  }

  @Delete('director/materials/:materialId')
  // @UseGuards(RolesGuard)
  // @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Remove a material' })
  @ApiParam({ name: 'materialId', description: 'Numeric material ID' })
  @ApiResponse({ status: 200, description: 'Material removed.' })
  remove(
    @Param('materialId', ParseIntIdPipe) materialId: number,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.materialsService.remove(materialId, req.user?.id || 1);
  }
}
