import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as quizDataRaw from './data/committee_quiz.json';

const quizData: any = (quizDataRaw as any).default || quizDataRaw;

interface AnswerPayload {
  questionId: number;
  answerId: string;
}

@Injectable()
export class QuizService {

  getQuestionsByCategory(category: string) {
    if (!quizData || !quizData.quizLists) {
      throw new BadRequestException('Quiz data not available');
    }

    const quizList = quizData.quizLists.find(
      (list: any) => list.category.toLowerCase() === category.toLowerCase(),
    );

    if (!quizList) {
      throw new NotFoundException(`Quiz for category ${category} not found`);
    }

    // Usually you may want to strip 'weight' before sending to client, but given
    // the prompt didn't specify we hide them we can return the list directly.
    return quizList;
  }

  calculateRecommendation(category: string, answers: AnswerPayload[]) {
    const quizList = this.getQuestionsByCategory(category);

    const scores: Record<string, number> = {};

    for (const answer of answers) {
      const question = quizList.questions.find((q: any) => q.id === answer.questionId);
      if (!question) continue;

      const selectedAnswer = question.answers.find((a: any) => a.id === answer.answerId);
      if (!selectedAnswer || !selectedAnswer.weight) continue;

      for (const [key, value] of Object.entries(selectedAnswer.weight)) {
        const numValue = value as number;
        scores[key] = (scores[key] || 0) + numValue;
      }
    }

    let recommendedKey = '';
    let maxScore = -1;

    for (const [key, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        recommendedKey = key;
      }
    }

    if (!recommendedKey) {
      throw new BadRequestException('No valid answers matched, could not determine recommendation');
    }

    // Map back to full committee name since keys in JSON don't exactly match the `committees` list visually
    const keyToCommitteeMap: Record<string, string> = {
      HR: 'Human Resources (HR)',
      PR: 'Public Relations (PR)',
      Logistics: 'Logistics',
      Frontend: 'Frontend',
      Backend: 'Backend',
      Mobile: 'Mobile App',
      GameDev: 'Game Development',
      DataAnalysis: 'Data Analysis',
      ML: 'Machine Learning',
      Graphic: 'Graphic Design',
      SocialMedia: 'Social Media',
      PV: 'Photography & Video Editing (PV)',
    };

    const finalCommittee = keyToCommitteeMap[recommendedKey] || recommendedKey;

    return {
      recommendedCommittee: finalCommittee,
      scores, // we can return scores for transparency
    };
  }
}