import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoadmapDto {
  @ApiProperty({
    description: 'Numeric ID of the director creating this roadmap',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  directorId: number;

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
