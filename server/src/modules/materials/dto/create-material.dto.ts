import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ description: 'Title of the material' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'File URL if already uploaded externally' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
