import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSessionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roadmapId?: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  sessionNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecorded?: boolean;

  @ApiPropertyOptional({ example: 'online' })
  @IsOptional()
  @IsString()
  meetingType?: string;
}
