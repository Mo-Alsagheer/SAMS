import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';

export class CreateApplicationDto {
  @ApiProperty({
    example: 1,
    description: 'Numeric recruitment process ID the applicant is applying for',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  processId: number;

  @ApiProperty({
    example: 'User Name',
    description: 'Applicant full name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Applicant email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+201234567890',
    description: 'Applicant phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'https://linkedin.com/in/johndoe',
    description: 'Applicant LinkedIn profile URL',
  })
  @IsUrl()
  linkedinLink: string;

  @ApiProperty({
    example: 'https://drive.google.com/file/d/abc/view',
    description: 'Applicant resume/CV drop link',
  })
  @IsUrl()
  cvLink: string;
}
