import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AuditLogService } from '../audit-log/audit-log.service';
import { getWelcomeTemplate } from './templates/welcome.template';
import { getStatusTemplate } from './templates/status.template';
import { getBroadcastTemplate } from './templates/broadcast.template';
import { getTerminationTemplate } from './templates/termination.template';
import { getPasswordResetTemplate } from './templates/password-reset.template';
import { getTestTemplate } from './templates/test.template';

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

    const html = getWelcomeTemplate(name, role, to, password, loginUrl);

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: '🎉 Welcome to SAMS — Your Account is Ready',
      html,
    });

    if (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
      this.audit
        .log({
          action: 'EmailService.sendWelcomeEmailFailed',
          body: { to, errorMessage: error.message },
        })
        .catch(() => undefined);
      return;
    }

    this.logger.log(`Welcome email sent to ${to} with ID ${data?.id}`);
    this.audit
      .log({ action: 'EmailService.sendWelcomeEmail', body: { to, role, emailId: data?.id } })
      .catch(() => undefined);
  }

  async sendTestEmail(to: string): Promise<any> {
    const html = getTestTemplate();

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: '🧪 SAMS Test Email',
      html,
    });

    if (error) {
      this.logger.error(`Failed to send test email to ${to}`, error);
      this.audit
        .log({
          action: 'EmailService.sendTestEmailFailed',
          body: { to, errorMessage: error.message },
        })
        .catch(() => undefined);
      return { success: false, error: error.message };
    }

    this.logger.log(`Test email sent to ${to} with ID ${data?.id}`);
    this.audit
      .log({ action: 'EmailService.sendTestEmail', body: { to, emailId: data?.id } })
      .catch(() => undefined);
    return { success: true, data };
  }

  async sendApplicationStatusEmail(opts: { to: string; name: string; status: string; role: string; details?: string }): Promise<void> {
    const { to, name, status, role, details } = opts;
    const html = getStatusTemplate(name, status, role, details);

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: `SAMS Application Update: ${status}`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send status email to ${to}`, error);
      this.audit.log({ action: 'EmailService.sendStatusFailed', body: { to, error: error.message } }).catch(() => {});
      return;
    }
    this.audit.log({ action: 'EmailService.sendStatus', body: { to, status, emailId: data?.id } }).catch(() => {});
  }

  async sendBroadcastEmail(opts: { to: string[]; subject: string; message: string; senderName?: string }): Promise<void> {
    const { to, subject, message, senderName } = opts;
    const html = getBroadcastTemplate(subject, message, senderName);

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to: this.fromAddress, // Resend SDK requires the 'to' field. We send to ourselves and BCC the list.
      bcc: to, // Use BCC for broadcasts to protect privacy
      subject: `📢 ${subject}`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send broadcast email`, error);
      this.audit.log({ action: 'EmailService.sendBroadcastFailed', body: { error: error.message } }).catch(() => {});
      return;
    }
    this.audit.log({ action: 'EmailService.sendBroadcast', body: { count: to.length, emailId: data?.id } }).catch(() => {});
  }

  async sendTerminationEmail(to: string, name: string): Promise<void> {
    const html = getTerminationTemplate(name);

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Important Notice Regarding Your SAMS Account',
      html,
    });

    if (error) {
      this.logger.error(`Failed to send termination email to ${to}`, error);
      this.audit.log({ action: 'EmailService.sendTerminationFailed', body: { to, error: error.message } }).catch(() => {});
      return;
    }
    this.audit.log({ action: 'EmailService.sendTermination', body: { to, emailId: data?.id } }).catch(() => {});
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void> {
    const html = getPasswordResetTemplate(name, resetLink);

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'SAMS Password Reset',
      html,
    });

    if (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      this.audit.log({ action: 'EmailService.sendPasswordResetFailed', body: { to, error: error.message } }).catch(() => {});
      return;
    }
    this.audit.log({ action: 'EmailService.sendPasswordReset', body: { to, emailId: data?.id } }).catch(() => {});
  }
}
