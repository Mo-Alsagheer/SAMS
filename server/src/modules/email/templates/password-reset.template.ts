export const getPasswordResetTemplate = (name: string, resetLink: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Password Reset Request</h2>
  <p>Hello ${name},</p>
  <p>We received a request to reset your password. Click the button below to choose a new one:</p>
  <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #2d3580; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
  <p>If you did not request this, you can safely ignore this email.</p>
</div>
`;
