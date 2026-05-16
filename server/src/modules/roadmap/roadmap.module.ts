import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadmapService } from './roadmap.service';
import { RoadmapController } from './roadmap.controller';
import { CommitteeRoadmapController } from './committee-roadmap.controller';
import { Roadmap } from './entities/roadmap.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roadmap])],
  controllers: [RoadmapController, CommitteeRoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
