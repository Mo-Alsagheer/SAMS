import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';

@Controller('committees')
export class CommitteeRoadmapController {
	constructor(private readonly roadmapService: RoadmapService) {}

	/**
	 * Gets the roadmap assigned to a committee.
	 * Purpose: expose the committee-scoped public read endpoint.
	 */
	@Get(':committeeId/roadmap')
	findByCommitteeId(@Param('committeeId', ParseIntIdPipe) committeeId: number) {
		return this.roadmapService.findByCommitteeId(committeeId);
	}

	/**
	 * Gets a roadmap by its numeric id.
	 * Purpose: support direct roadmap lookups when the id is known.
	 */
	@Get('roadmap/:id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.roadmapService.findOne(id);
	}
}