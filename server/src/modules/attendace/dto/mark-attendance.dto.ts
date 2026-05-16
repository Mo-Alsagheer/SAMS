import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty({
    type: [Number],
    description: 'User IDs to mark as attended for this session',
    example: [1, 2, 3],
  })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  userIds: number[];
}
