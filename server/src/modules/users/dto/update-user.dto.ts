import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/constants/role.enum';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'User email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: Role, description: 'User role' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Committee ID' })
  @IsOptional()
  @IsInt()
  committeeId?: number;

  @ApiPropertyOptional({ enum: UserStatus, description: 'User status' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seasonNumbers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalID?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  universityID?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}
