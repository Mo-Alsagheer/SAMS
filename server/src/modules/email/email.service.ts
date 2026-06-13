import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly audit: AuditLogService,
  ) {
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
      this.logger.log(
        `\n\n========================================\n[WELCOME EMAIL FOR ${to}]: Role = ${role} | Temporary Password = ${password}\n========================================\n\n`,
      );

      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject: '🎉 Welcome to SAMS — Your Account is Ready',
        html,
      });
      this.logger.log(`Welcome email sent to ${to}`);
      this.audit
        .log({ action: 'EmailService.sendWelcomeEmail', body: { to, role } })
        .catch(() => undefined);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
      this.audit
        .log({
          action: 'EmailService.sendWelcomeEmailFailed',
          body: { to, errorMessage: String(error) },
        })
        .catch(() => undefined);
      // Do not rethrow — email failure should not block the acceptance response
    }
  }

  async sendForgetPasswordEmail(opts: {
    to: string;
    resetToken: string;
    resetUrl: string;
  }): Promise<void> {
    const { to, resetToken, resetUrl } = opts;
    const finalUrl = `${resetUrl}?token=${resetToken}`;

    this.logger.log(
      `\n\n========================================\n[PASSWORD RESET LINK FOR ${to}]: ${finalUrl}\n========================================\n\n`,
    );

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1f3c 0%, #2d3580 100%); padding: 40px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 1px; }
    .body { padding: 36px 32px; }
    .text { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 24px; }
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
    </div>
    <div class="body">
      <p class="text">
        We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
      </p>
      <p class="text">Click the button below to reset your password:</p>
      <div class="btn-wrap">
        <a href="${finalUrl}" class="btn">Reset Password</a>
      </div>
      <p class="notice">
        This link will expire in 15 minutes.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} SAMS. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject: '🔒 Reset Your SAMS Password',
        html,
      });
      this.logger.log(`Forget password email sent to ${to}`);
      this.audit
        .log({ action: 'EmailService.sendForgetPasswordEmail', body: { to } })
        .catch(() => undefined);
    } catch (error) {
      this.logger.error(`Failed to send forget password email to ${to}`, error);
      this.audit
        .log({
          action: 'EmailService.sendForgetPasswordEmailFailed',
          body: { to, errorMessage: String(error) },
        })
        .catch(() => undefined);
    }
  }

  async sendApplicationStatusEmail(opts: {
    to: string;
    name: string;
    status: string;
    additionalInfo?: string;
  }): Promise<void> {
    const { to, name, status, additionalInfo } = opts;

    let statusText = '';
    let descriptionText = '';
    let headerColor = 'linear-gradient(135deg, #1a1f3c 0%, #2d3580 100%)';

    switch (status) {
      case 'PHASE1_ACCEPTED':
        statusText = 'Phase 1 Accepted 🎉';
        descriptionText =
          'Congratulations! Your application has successfully passed the initial screening (Phase 1 evaluation).';
        break;
      case 'PHASE1_REJECTED':
        statusText = 'Application Update - Not Accepted';
        descriptionText =
          'Thank you for your interest in SAMS. Unfortunately, your application did not pass the initial screening phase at this time.';
        headerColor = 'linear-gradient(135deg, #3c1a1a 0%, #802d2d 100%)';
        break;
      case 'INTERVIEW_SCHEDULED':
        statusText = 'Interview Scheduled 📅';
        descriptionText =
          'Great news! An interview has been scheduled for your application.';
        break;
      case 'PHASE2_ACCEPTED':
        statusText = 'Welcome to SAMS! 🎉';
        descriptionText =
          'Congratulations! You have been officially accepted as a member.';
        break;
      case 'PHASE2_REJECTED':
        statusText = 'Application Update - Not Accepted';
        descriptionText =
          'Thank you for interviewing with us. Unfortunately, we will not be moving forward with your application at this time.';
        headerColor = 'linear-gradient(135deg, #3c1a1a 0%, #802d2d 100%)';
        break;
      default:
        statusText = 'Application Status Update';
        descriptionText = `Your application status has been updated to: ${status}.`;
    }

    this.logger.log(
      `\n\n========================================\n[APPLICATION STATUS EMAIL FOR ${to}]: Status = ${statusText} | Info = ${additionalInfo || 'None'}\n========================================\n\n`,
    );

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Status Update</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: ${headerColor}; padding: 40px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 1px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 18px; color: #1a1f3c; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 24px; }
    .details { background: #f0f3ff; border-left: 4px solid #2d3580; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }
    .details p { margin: 0 0 10px; font-size: 14px; color: #444; }
    .details p:last-child { margin: 0; }
    .footer { background: #f8f9fe; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>SAMS</h1>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${name}!</div>
      <p class="text">${descriptionText}</p>
      <div class="details">
        <p><strong>New Status:</strong> ${statusText}</p>
        ${additionalInfo ? `<p>${additionalInfo}</p>` : ''}
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} SAMS. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject: `SAMS: Application Status Update — ${statusText}`,
        html,
      });
      this.logger.log(
        `Application status email sent to ${to} for status ${status}`,
      );
      this.audit
        .log({
          action: 'EmailService.sendApplicationStatusEmail',
          body: { to, status },
        })
        .catch(() => undefined);
    } catch (error) {
      this.logger.error(`Failed to send status update email to ${to}`, error);
      this.audit
        .log({
          action: 'EmailService.sendApplicationStatusEmailFailed',
          body: { to, errorMessage: String(error) },
        })
        .catch(() => undefined);
    }
  }
}
