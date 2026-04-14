import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@ApiTags('quiz')
@Controller('committees/:committeeId/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @ApiOperation({ summary: 'Get generated quiz questions for a committee' })
  @ApiParam({ name: 'committeeId', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 200, description: 'List of quiz questions.' })
  @ApiResponse({ status: 404, description: 'Committee or quiz not found.' })
  getQuiz(@Param('committeeId') committeeId: string) {
    return this.quizService.generateQuiz(committeeId);
  }

  @Post('submissions')
  @ApiOperation({ summary: 'Submit quiz answers for evaluation' })
  @ApiParam({ name: 'committeeId', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string', example: 'q1' },
              answer: { type: 'string', example: 'My answer to the question.' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Quiz answers submitted and evaluated.' })
  @ApiResponse({ status: 404, description: 'Committee or quiz not found.' })
  submitQuiz(@Param('committeeId') committeeId: string, @Body() answers: any) {
    return this.quizService.submitAnswers(committeeId, answers);
  }
}
