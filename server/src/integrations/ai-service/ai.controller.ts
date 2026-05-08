import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('applications/evaluate')
  @ApiOperation({ summary: 'Evaluate an application using AI' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string', example: '01HRG...' },
        answers: {
          type: 'array',
          items: { type: 'string' },
          example: ['Answer 1', 'Answer 2'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Evaluation completed successfully.',
  })
  evaluateApplication(@Body() payload: any) {
    return this.aiService.evaluateApplication(payload);
  }

  @Post('interview/agent')
  @ApiOperation({ summary: 'Interact with AI interview agent' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'session_123' },
        message: {
          type: 'string',
          example: 'Hello, I am ready for the interview.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'AI agent response generated.' })
  interviewAgent(@Body() payload: any) {
    return this.aiService.interviewAgent(payload);
  }
}
