import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommitteeDescriptionDto {
  @ApiProperty({
    example: 'This committee is primarily responsible for public relations...',
    description: 'The new description for the committee',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
