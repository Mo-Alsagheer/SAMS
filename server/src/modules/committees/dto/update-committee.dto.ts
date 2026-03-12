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
import { CommitteeType } from '../enums/committee-type.enum';

export class UpdateCommitteeDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(CommitteeType)
  @IsOptional()
  type?: CommitteeType;

  @IsString()
  @IsOptional()
  planID?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  directorIDs?: string[];

  @IsInt()
  @Min(0)
  @IsOptional()
  membersCount?: number;

  @IsUrl()
  @IsOptional()
  whatsappGroupLink?: string;
}
