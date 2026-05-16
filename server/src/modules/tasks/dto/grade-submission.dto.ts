import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ minimum: 0, maximum: 5, example: 4 })
  @IsInt()
  @Min(0)
  @Max(5)
  score: number;
}
