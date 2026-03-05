import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommitteeDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
