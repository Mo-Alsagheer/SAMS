import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommitteeType } from '../enums/committee-type.enum';

export class CreateCommitteeDto {
  @ApiProperty({
    example: 'Technical Committee',
    description: 'The name of the committee',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'Responsible for organizing technical workshops and hackathons.',
    description: 'A detailed description of the committee',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    enum: CommitteeType,
    example: CommitteeType.TECHNICAL,
    description: 'The type/category of the committee',
  })
  @IsEnum(CommitteeType)
  type: CommitteeType;

  @ApiPropertyOptional({
    example: '01HRGZ...',
    description: 'The ID of the plan associated with this committee',
  })
  @IsString()
  @IsOptional()
  planID?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['01HRGZ...', '01HRGZ...'],
    description: 'List of director user IDs managing this committee',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  directorIDs?: string[];

  @ApiPropertyOptional({
    example: 10,
    description: 'The target or current members count',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  membersCount?: number;

  @ApiPropertyOptional({
    example: 'https://chat.whatsapp.com/invite-link',
    description: 'The WhatsApp group invite link for the committee',
  })
  @IsUrl()
  @IsOptional()
  whatsappGroupLink?: string;
}
