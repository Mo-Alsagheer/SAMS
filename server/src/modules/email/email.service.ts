import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromAddress =
      this.configService.get<string>('RESEND_FROM_ADDRESS') ??
      'SAMS <onboarding@resend.dev>';
  }

  async sendWelcomeEmail(opts: {
    to: string;
    name: string;
    role: string;
    password: string;
    loginUrl: string;
  }): Promise<void> {
    const { to, name, role, password, loginUrl } = opts;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to SAMS</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1f3c 0%, #2d3580 100%); padding: 40px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 1px; }
    .header p { margin: 6px 0 0; color: #a8b4e8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 18px; color: #1a1f3c; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 24px; }
    .credentials { background: #f0f3ff; border-left: 4px solid #2d3580; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }
    .credentials p { margin: 0 0 10px; font-size: 14px; color: #444; }
    .credentials p:last-child { margin: 0; }
    .credentials strong { color: #1a1f3c; }
    .credentials .value { font-family: monospace; font-size: 15px; background: #e8ecff; padding: 2px 8px; border-radius: 4px; color: #2d3580; }
    .btn-wrap { text-align: center; margin-bottom: 28px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2d3580, #4a54c4); color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; }
    .notice { font-size: 13px; color: #888; text-align: center; line-height: 1.6; }
    .footer { background: #f8f9fe; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>SAMS</h1>
      <p>Student Activity Management System</p>
    </div>
    <div class="body">
      <div class="greeting">Welcome aboard, ${name}! 🎉</div>
      <p class="text">
        Congratulations! Your application has been <strong>accepted</strong> and you have been officially assigned as a <strong>${role}</strong>.
        Your account is now active and ready to use.
      </p>
      <div class="credentials">
        <p><strong>Email:</strong> <span class="value">${to}</span></p>
        <p><strong>Temporary Password:</strong> <span class="value">${password}</span></p>
      </div>
      <p class="text">Use the button below to sign in, then change your password from your profile settings.</p>
      <div class="btn-wrap">
        <a href="${loginUrl}" class="btn">Sign in to SAMS</a>
      </div>
      <p class="notice">
        If you didn't expect this email, please contact your administrator immediately.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} SAMS — Student Activity Management System. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject: '🎉 Welcome to SAMS — Your Account is Ready',
        html,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
      // Do not rethrow — email failure should not block the acceptance response
    }
  }
}
