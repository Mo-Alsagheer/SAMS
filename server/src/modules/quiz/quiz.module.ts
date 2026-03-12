import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [AiModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
