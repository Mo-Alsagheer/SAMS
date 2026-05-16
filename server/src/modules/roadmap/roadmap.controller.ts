import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';

@ApiTags('roadmap')
@Controller('roadmap')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Post()
  @ApiOperation({ summary: 'Create a roadmap associated with a director' })
  create(@Body() createRoadmapDto: CreateRoadmapDto) {
    return this.roadmapService.create(createRoadmapDto);
  }

  @Get()
  findAll() {
    return this.roadmapService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roadmapService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Patch(':committeeId')
  update(
    @Param('committeeId', ParseIntIdPipe) committeeId: number,
    @Body() updateRoadmapDto: UpdateRoadmapDto,
  ) {
    return this.roadmapService.updateByCommitteeId(
      committeeId,
      updateRoadmapDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Patch('by-id/:id')
  updateById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoadmapDto: UpdateRoadmapDto,
  ) {
    return this.roadmapService.update(id, updateRoadmapDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Patch(':id/assign/:committeeId')
  assignCommittee(
    @Param('id', ParseIntPipe) id: number,
    @Param('committeeId', ParseIntIdPipe) committeeId: number,
  ) {
    return this.roadmapService.assignCommittee(id, committeeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Patch(':id/unassign')
  unassignCommittee(@Param('id', ParseIntPipe) id: number) {
    return this.roadmapService.unassignCommittee(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roadmapService.remove(id);
  }
}
