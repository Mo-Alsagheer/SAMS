export const getTerminationTemplate = (name: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Important Notice from SAMS</h2>
  <p>Dear ${name},</p>
  <p>We regret to inform you that your membership has been terminated.</p>
  <p>If you have any questions, please reach out to the administrative team.</p>
</div>
`;
