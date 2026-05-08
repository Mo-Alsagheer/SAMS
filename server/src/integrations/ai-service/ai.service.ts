import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.aiBaseUrl = this.configService.get<string>(
      'AI_BASE_URL',
      'http://localhost:8000',
    );
  }

  async evaluateApplication(payload: any) {
    try {
      const response = await fetch(`${this.aiBaseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`AI Service Eval Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to evaluate application', error);
      throw error;
    }
  }

  async interviewAgent(payload: any) {
    try {
      const response = await fetch(`${this.aiBaseUrl}/interview/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`AI Service Interview Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to contact interview agent', error);
      throw error;
    }
  }

  async evaluateBatchApplications(payload: any) {
    try {
      const response = await fetch(`${this.aiBaseUrl}/evaluate/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`AI Service Batch Eval Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to batch evaluate applications', error);
      throw error;
    }
  }
}
