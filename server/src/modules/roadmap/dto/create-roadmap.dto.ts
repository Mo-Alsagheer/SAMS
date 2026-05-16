import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoadmapDto {
	@ApiProperty({
		description: 'ULID of the director creating this roadmap',
		example: '01KJZDXEV4YDQJ0JQP11GDRHW2',
	})
	@IsString()
	@IsNotEmpty()
	directorId: string;

	@ApiProperty({
		description: 'Roadmap title',
		example: 'Intro to JavaScript',
	})
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiPropertyOptional({
		description: 'Optional roadmap description',
		example: 'Fundamentals and practical sessions',
	})
	@IsString()
	@IsOptional()
	description?: string;
}
