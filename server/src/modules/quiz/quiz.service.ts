import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Injectable()
export class QuizService {
  constructor(private readonly aiService: AiService) {}

  async generateQuiz(committeeId: string) {
    return this.aiService.generateQuizContent();
  }

  async submitAnswers(committeeId: string, answers: any) {
    return this.aiService.evaluateApplication({ committeeId, answers });
  }
}
