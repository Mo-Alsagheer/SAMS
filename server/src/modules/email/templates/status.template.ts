export const getStatusTemplate = (name: string, status: string, role: string, details?: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>SAMS Application Update</h2>
  <p>Hello ${name},</p>
  <p>Your application for the role of <strong>${role}</strong> has been updated.</p>
  <p>New Status: <strong>${status}</strong></p>
  ${details ? `<p>${details}</p>` : ''}
  <p>Thank you for your interest in our community.</p>
</div>
`;
