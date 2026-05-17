import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';

export class MemberAttendanceScoreDto {
  @ApiProperty({ description: 'User ID of the committee member', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Score for attendance (0 to 5)',
    example: 5,
    minimum: 0,
    maximum: 5,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  score: number;
}

export class MarkAttendanceDto {
  @ApiProperty({
    type: [MemberAttendanceScoreDto],
    description: 'Array of committee members with their attendance scores',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberAttendanceScoreDto)
  members: MemberAttendanceScoreDto[];
}
