import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmitTaskDto {
  @ApiPropertyOptional({ description: 'Text content submission' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'File submission',
  })
  @IsOptional()
  file?: any;
}
