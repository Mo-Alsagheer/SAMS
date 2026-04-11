import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';

export class OpenRecruitmentDto {
  @ApiProperty({ description: 'The target member quota for the recruitment', example: 10 })
  @IsInt()
  @Min(1)
  targetMembers: number;

  @ApiProperty({ description: 'The target role (MEMBER or DIRECTOR)', enum: Role, example: Role.MEMBER })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
