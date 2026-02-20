import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommitteesService } from './committees.service';
import { UpdateCommitteeDescriptionDto } from './dto/update-committee-description.dto';

@Controller('director/committees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIRECTOR)
export class DirectorCommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Patch(':committeeId/description')
  updateDescription(
    @Param('committeeId', new ParseUUIDPipe()) committeeId: string,
    @Body() dto: UpdateCommitteeDescriptionDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    const committee = this.committeesService.getById(committeeId);
    if (committee.directorId !== user.id) {
      throw new ForbiddenException('Director not assigned to committee');
    }
    return this.committeesService.updateDescription(committeeId, dto.description);
  }
}
