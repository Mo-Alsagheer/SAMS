import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateRoadmapDto {
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsInt()
  committeeId?: number | null;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}
