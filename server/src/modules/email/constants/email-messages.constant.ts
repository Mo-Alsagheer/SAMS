export const EmailMessages = {
  APPLICATION_RECEIVED: {
    status: 'Application Received',
    getDetails: () => 'We have successfully received your application. Our team will review it and get back to you shortly.',
  },
  PHASE1_ACCEPTED: {
    status: 'Phase 1 Accepted',
    getDetails: () => 'Congratulations! You have passed the first phase of the application process. Please await further instructions for your interview.',
  },
  PHASE1_REJECTED: {
    status: 'Phase 1 Rejected',
    getDetails: () => 'Unfortunately, your application did not pass the first phase. Thank you for your interest and we encourage you to apply again next time.',
  },
  INTERVIEW_SCHEDULED: {
    status: 'Interview Scheduled',
    getDetails: (payload: any) => `Your interview has been scheduled. Details: ${JSON.stringify(payload)}`,
  },
  PHASE2_REJECTED: {
    status: 'Phase 2 Rejected',
    getDetails: () => 'After careful consideration, we have decided not to proceed with your application at this time. We appreciate the effort you put into the process.',
  }
};
