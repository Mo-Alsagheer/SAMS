import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@ApiTags('quiz')
@Controller('committees/:committeeId/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @ApiOperation({ summary: 'Get generated quiz questions for a committee' })
  getQuiz(@Param('committeeId') committeeId: string) {
    return this.quizService.generateQuiz(committeeId);
  }

  @Post('submissions')
  @ApiOperation({ summary: 'Submit quiz answers for evaluation' })
  submitQuiz(@Param('committeeId') committeeId: string, @Body() answers: any) {
    return this.quizService.submitAnswers(committeeId, answers);
  }
}
