import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('questions/:category')
  @ApiOperation({ summary: 'Get quiz questions by committee category' })
  @ApiParam({
    name: 'category',
    description:
      'Category name exactly as in JSON (e.g. Operation, Technical, Media)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of quiz questions for the category.',
  })
  @ApiResponse({ status: 404, description: 'Quiz category not found.' })
  getQuestionsByCategory(@Param('category') category: string) {
    return this.quizService.getQuestionsByCategory(category);
  }

  @Post('recommendation')
  @ApiOperation({
    summary: 'Calculate recommended committee based on quiz answers',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        category: { type: 'string', example: 'Technical' },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'number', example: 1 },
              answerId: { type: 'string', example: 'A' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The recommended committee and the scores.',
  })
  @ApiResponse({ status: 400, description: 'Invalid payload or quiz data.' })
  calculateRecommendation(
    @Body()
    payload: {
      category: string;
      answers: { questionId: number; answerId: string }[];
    },
  ) {
    return this.quizService.calculateRecommendation(
      payload.category,
      payload.answers,
    );
  }
}
