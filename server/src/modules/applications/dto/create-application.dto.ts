import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({
    example: '01HRGZ...',
    description: 'The ULID of the committee you are applying to',
  })
  @IsString()
  @IsNotEmpty()
  committeeId: string;

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
