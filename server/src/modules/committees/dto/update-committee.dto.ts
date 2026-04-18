import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommitteeType } from '../enums/committee-type.enum';

/** Converts an empty string (common in multipart/form-data) to undefined
 * so that @IsOptional() correctly skips validation for omitted fields. */
const emptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class UpdateCommitteeDto {
  @ApiPropertyOptional({
    example: 'Updated Technical Committee Name',
    description: 'The name of the committee',
    maxLength: 200,
  })
  @emptyToUndefined()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated committee description.',
    description: 'A detailed description of the committee',
    maxLength: 2000,
  })
  @emptyToUndefined()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    enum: CommitteeType,
    example: CommitteeType.TECHNICAL,
    description: 'The type/category of the committee',
  })
  @emptyToUndefined()
  @IsEnum(CommitteeType)
  @IsOptional()
  type?: CommitteeType;

  @ApiPropertyOptional({
    example: '01HRGZ...',
    description: 'The ID of the plan associated with this committee',
  })
  @emptyToUndefined()
  @IsString()
  @IsOptional()
  planID?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['01HRGZ...'],
    description: 'List of director user IDs managing this committee',
  })
  @Transform(({ value }) => {
    if (value === '' || value == null) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  directorIDs?: string[];

  @ApiPropertyOptional({
    example: 15,
    description: 'The target or current members count',
    minimum: 0,
  })
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @IsOptional()
  membersCount?: number;

  @ApiPropertyOptional({
    example: 'https://chat.whatsapp.com/new-invite-link',
    description: 'The WhatsApp group invite link for the committee',
  })
  @emptyToUndefined()
  @IsUrl()
  @IsOptional()
  whatsappGroupLink?: string | null;
}
