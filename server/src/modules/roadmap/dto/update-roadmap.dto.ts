import { IsOptional, IsString } from 'class-validator';

export class UpdateRoadmapDto {
  @IsOptional()
  @IsString()
  committeeId?: string | null;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}
