import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoadmapByDirectorDto {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsOptional()
	description?: string;
}