import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty({
    type: [String],
    description: 'User IDs to mark as attended for this session',
    example: ['01HRGZ...', '01HRGZ...'],
  })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
