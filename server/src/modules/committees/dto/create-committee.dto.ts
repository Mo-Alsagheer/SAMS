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
import { CommitteeType } from '../enums/committee-type.enum';

export class CreateCommitteeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(CommitteeType)
  type: CommitteeType;

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
