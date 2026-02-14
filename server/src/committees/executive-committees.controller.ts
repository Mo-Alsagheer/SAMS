import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@Controller('executive/committees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXECUTIVE)
export class ExecutiveCommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Post()
  create(@Body() dto: CreateCommitteeDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.committeesService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommitteeDto,
  ) {
    return this.committeesService.update(id, dto);
  }
}
