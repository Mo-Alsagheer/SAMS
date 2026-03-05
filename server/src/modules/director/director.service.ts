import { Injectable } from '@nestjs/common';

@Injectable()
export class DirectorService {
  async getApplications(committeeId: string, status?: string) {
    // Return mock logic, actual logic depends on Application entity
    return [];
  }

  async acceptPhase1(applicationId: string) {
    return { status: 'PHASE1_ACCEPTED', applicationId };
  }

  async rejectPhase1(applicationId: string) {
    return { status: 'PHASE1_REJECTED', applicationId };
  }

  async scheduleInterview(applicationId: string, payload: any) {
    return { status: 'INTERVIEW_SCHEDULED', applicationId, ...payload };
  }

  async acceptPhase2(applicationId: string) {
    return { status: 'PHASE2_ACCEPTED', applicationId };
  }

  async rejectPhase2(applicationId: string) {
    return { status: 'PHASE2_REJECTED', applicationId };
  }
}
