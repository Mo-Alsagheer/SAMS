import { IsEnum, IsInt, IsNotEmpty, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';

export class OpenRecruitmentDto {
  @ApiProperty({
    description: 'The target member quota for the recruitment',
    example: 10,
  })
  @IsInt()
  @Min(1)
  targetMembers: number;

  @ApiProperty({
    description: 'The target role (MEMBER or DIRECTOR)',
    enum: Role,
    example: Role.MEMBER,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiPropertyOptional({ example: '2026-06-13T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @ApiPropertyOptional({ example: '2026-06-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  closedAt?: string;
}
