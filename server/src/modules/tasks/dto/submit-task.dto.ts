import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class SubmitTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.fileUrl)
  content?: string;

  @ApiPropertyOptional({ description: 'Cloudinary URL for uploaded file' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.content)
  fileUrl?: string;
}
