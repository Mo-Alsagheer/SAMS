import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('quiz/generate')
  @ApiOperation({ summary: 'Generate dynamic quiz using AI' })
  generateQuiz() {
    return this.aiService.generateQuizContent();
  }

  @Post('applications/evaluate')
  @ApiOperation({ summary: 'Evaluate an application using AI' })
  evaluateApplication(@Body() payload: any) {
    return this.aiService.evaluateApplication(payload);
  }

  @Post('interview/agent')
  @ApiOperation({ summary: 'Interact with AI interview agent' })
  interviewAgent(@Body() payload: any) {
    return this.aiService.interviewAgent(payload);
  }
}
