import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ minimum: 0, maximum: 10, example: 8 })
  @IsInt()
  @Min(0)
  @Max(10)
  score: number;
}
