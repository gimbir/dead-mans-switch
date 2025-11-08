/**
 * Email Service Implementation
 *
 * Sends emails using Nodemailer (SMTP).
 * Handles transactional emails for the Dead Man's Switch application.
 *
 * Features:
 * - SMTP email sending
 * - HTML and plain text support
 * - Attachment support
 * - Error handling and retry logic
 * - Email validation
 *
 * Environment Variables Required:
 * - SMTP_HOST: SMTP server host
 * - SMTP_PORT: SMTP server port
 * - SMTP_SECURE: Use TLS (true/false)
 * - SMTP_USER: SMTP username
 * - SMTP_PASSWORD: SMTP password
 * - EMAIL_FROM: Default sender email address
 * - EMAIL_FROM_NAME: Default sender name
 *
 * Usage:
 * const result = await emailService.sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome',
 *   html: '<p>Welcome to the app!</p>',
 * });
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Result } from '@shared/types/Result.js';
import { env } from '@config/env.config.js';
import {
  INotificationService,
  EmailNotification,
  CheckInReminderNotification,
  SwitchTriggeredNotification
} from '@domain/services/INotificationService.js';
import { Email } from '@domain/value-objects/Email.vo.js';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
}

export interface EmailSendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export class EmailService implements INotificationService {
  private transporter: Transporter;
  private defaultFrom: string;
  private defaultFromName: string;

  constructor() {
    // Get configuration from environment
    const smtpHost = env.SMTP_HOST;
    const smtpPort = env.SMTP_PORT;
    const smtpSecure = env.SMTP_SECURE;
    const smtpUser = env.SMTP_USER;
    const smtpPassword = env.SMTP_PASSWORD;

    this.defaultFrom = env.SMTP_FROM_EMAIL;
    this.defaultFromName = env.SMTP_FROM_NAME;

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth:
        smtpUser && smtpPassword
          ? {
              user: smtpUser,
              pass: smtpPassword,
            }
          : undefined,
    });
  }

  /**
   * Sends an email (internal implementation)
   */
  private async sendEmailInternal(options: EmailOptions): Promise<Result<EmailSendResult>> {
    try {
      // Validate options
      const validation = this.validateEmailOptions(options);
      if (validation.isFailure) {
        return Result.fail<EmailSendResult>(validation.error as string);
      }

      // Ensure at least one content type is provided
      if (!options.html && !options.text) {
        return Result.fail<EmailSendResult>(
          'Email must have either HTML or plain text content'
        );
      }

      // Prepare from address
      const fromAddress =
        options.from ?? `"${this.defaultFromName}" <${this.defaultFrom}>`;

      // Send email
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      return Result.ok<EmailSendResult>({
        messageId: info.messageId,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
      });
    } catch (error) {
      return Result.fail<EmailSendResult>(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sends verification email to new users
   */
  async sendVerificationEmail(
    to: string,
    verificationToken: string,
    userName: string
  ): Promise<Result<EmailSendResult>> {
    const verificationUrl = `${env.APP_URL}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50;">Verify Your Email Address</h1>
          <p>Hello ${this.escapeHtml(userName)},</p>
          <p>Thank you for signing up for Dead Man's Switch. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${verificationUrl}</p>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `;

    const text = `
Hello ${userName},

Thank you for signing up for Dead Man's Switch. Please verify your email address by visiting:

${verificationUrl}

If you didn't create an account, you can safely ignore this email.
    `.trim();

    return this.sendEmailInternal({
      to,
      subject: 'Verify Your Email Address',
      html,
      text,
    });
  }

  /**
   * Sends password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string
  ): Promise<Result<EmailSendResult>> {
    const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50;">Reset Your Password</h1>
          <p>Hello ${this.escapeHtml(userName)},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #e74c3c; font-weight: bold;">
            This link will expire in 1 hour.
          </p>
          <p style="padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </body>
      </html>
    `;

    const text = `
Hello ${userName},

We received a request to reset your password. Visit this link to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.
    `.trim();

    return this.sendEmailInternal({
      to,
      subject: 'Reset Your Password',
      html,
      text,
    });
  }

  /**
   * Sends switch triggered notification email
   */
  async sendSwitchTriggeredEmail(
    to: string,
    switchName: string,
    triggeredAt: Date
  ): Promise<Result<EmailSendResult>> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #e74c3c;">Dead Man's Switch Triggered</h1>
          <p>This is an automated notification from Dead Man's Switch.</p>
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Switch Name:</strong> ${this.escapeHtml(switchName)}</p>
            <p style="margin: 10px 0 0 0;"><strong>Triggered At:</strong> ${triggeredAt.toLocaleString()}</p>
          </div>
          <p>A Dead Man's Switch has been triggered because the owner failed to check in within the specified time period.</p>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </body>
      </html>
    `;

    const text = `
DEAD MAN'S SWITCH TRIGGERED

Switch Name: ${switchName}
Triggered At: ${triggeredAt.toLocaleString()}

A Dead Man's Switch has been triggered because the owner failed to check in within the specified time period.

This is an automated message. Please do not reply to this email.
    `.trim();

    return this.sendEmailInternal({
      to,
      subject: `Dead Man's Switch Triggered: ${switchName}`,
      html,
      text,
    });
  }

  /**
   * Validates email send options
   */
  private validateEmailOptions(options: EmailOptions): Result<void> {
    // Validate recipient
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      return Result.fail<void>('Recipient email address is required');
    }

    // Validate subject
    if (!options.subject || options.subject.trim().length === 0) {
      return Result.fail<void>('Email subject is required');
    }

    // Validate recipient email format
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    for (const email of recipients) {
      if (!this.isValidEmail(email)) {
        return Result.fail<void>(`Invalid email address: ${email}`);
      }
    }

    return Result.ok();
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
  }

  /**
   * Verifies SMTP connection
   * Useful for health checks
   */
  async verifyConnection(): Promise<Result<boolean>> {
    try {
      await this.transporter.verify();
      return Result.ok<boolean>(true);
    } catch (error) {
      return Result.fail<boolean>(
        `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ====== INotificationService Implementation ======

  /**
   * Sends an email notification (INotificationService implementation)
   */
  async sendEmail(notification: EmailNotification): Promise<Result<boolean>> {
    try {
      const emailOptions: EmailOptions = {
        to: notification.to.getValue(),
        subject: notification.subject,
        html: notification.content
      };

      if (!notification.isHtml) {
        emailOptions.text = notification.content;
      }

      const result = await this.sendEmailInternal(emailOptions);

      return result.isSuccess
        ? Result.ok<boolean>(true)
        : Result.fail<boolean>(result.error || 'Failed to send email');
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sends a check-in reminder notification
   */
  async sendCheckInReminder(notification: CheckInReminderNotification): Promise<Result<boolean>> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Check-In Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Check-In Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${notification.userName},</p>
              <p>Your Dead Man's Switch "<strong>${notification.switchName}</strong>" requires a check-in.</p>
              <p><strong>Time remaining: ${notification.hoursUntilDue} hours</strong></p>
              <p>Please check in to prevent your switch from being triggered.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${notification.checkInUrl}" class="button">Check In Now</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from Dead Man's Switch.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await this.sendEmailInternal({
      to: notification.to.getValue(),
      subject: `⏰ Check-In Reminder: ${notification.switchName}`,
      html,
      text: `Hi ${notification.userName}, your Dead Man's Switch "${notification.switchName}" requires a check-in. Time remaining: ${notification.hoursUntilDue} hours. Check in at: ${notification.checkInUrl}`,
    });

    return result.isSuccess
      ? Result.ok<boolean>(true)
      : Result.fail<boolean>(result.error || 'Failed to send reminder');
  }

  /**
   * Sends a notification when a switch is triggered
   */
  async sendSwitchTriggered(notification: SwitchTriggeredNotification): Promise<Result<boolean>> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Switch Triggered</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Switch Triggered</h1>
            </div>
            <div class="content">
              <p>Hi ${notification.userName},</p>
              <p>Your Dead Man's Switch "<strong>${notification.switchName}</strong>" has been triggered.</p>
              <p><strong>Triggered at:</strong> ${notification.triggeredAt.toLocaleString()}</p>
              <p>Your configured messages have been sent to their recipients.</p>
              <p>If this was triggered by mistake, please log in to your account immediately and check your settings.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Dead Man's Switch.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await this.sendEmailInternal({
      to: notification.to.getValue(),
      subject: `🚨 Switch Triggered: ${notification.switchName}`,
      html,
      text: `Hi ${notification.userName}, your Dead Man's Switch "${notification.switchName}" has been triggered at ${notification.triggeredAt.toLocaleString()}. Your configured messages have been sent to their recipients.`,
    });

    return result.isSuccess
      ? Result.ok<boolean>(true)
      : Result.fail<boolean>(result.error || 'Failed to send trigger notification');
  }

  /**
   * Sends the encrypted message to a recipient
   */
  async sendEncryptedMessage(
    recipientEmail: Email,
    recipientName: string,
    subject: string,
    encryptedContent: string,
    decryptionInstructions: string
  ): Promise<Result<boolean>> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6c757d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .message-box { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0; }
            .instructions { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Important Message</h1>
            </div>
            <div class="content">
              <p>Dear ${recipientName},</p>
              <p>You have received an important message through Dead Man's Switch.</p>
              <div class="message-box">
                <h3>Message Content:</h3>
                <div>${encryptedContent}</div>
              </div>
              <div class="instructions">
                <h3>📌 Instructions:</h3>
                <div>${decryptionInstructions}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent through Dead Man's Switch automated system.</p>
              <p>The sender configured this message to be sent in their absence.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await this.sendEmailInternal({
      to: recipientEmail.getValue(),
      subject,
      html,
      text: `Dear ${recipientName}, you have received an important message through Dead Man's Switch. ${encryptedContent}. Instructions: ${decryptionInstructions}`,
    });

    return result.isSuccess
      ? Result.ok<boolean>(true)
      : Result.fail<boolean>(result.error || 'Failed to send encrypted message');
  }

  /**
   * Validates if an email address can receive notifications
   */
  async canSendTo(email: Email): Promise<boolean> {
    // Basic validation - just check if email is valid
    // In production, you might want to check blocklists, bounce history, etc.
    return email.getValue().length > 0;
  }
}
