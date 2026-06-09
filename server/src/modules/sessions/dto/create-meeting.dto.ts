import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ example: '2026-06-01T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiProperty({ example: 'online' })
  @IsString()
  @IsNotEmpty()
  meetingType: string;
}
