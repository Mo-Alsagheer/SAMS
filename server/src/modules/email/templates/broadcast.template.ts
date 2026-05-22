export const getBroadcastTemplate = (subject: string, message: string, senderName?: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Announcement from SAMS</h2>
  ${senderName ? `<p><em>Sent by ${senderName}</em></p>` : ''}
  <div style="padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
    ${message}
  </div>
</div>
`;
