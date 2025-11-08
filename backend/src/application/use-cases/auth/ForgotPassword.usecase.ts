/**
 * Forgot Password Use Case
 *
 * Business logic for password reset request.
 *
 * Workflow:
 * 1. Validate input (DTO validation)
 * 2. Find user by email
 * 3. If user not found, return success anyway (security best practice)
 * 4. Check if user is deleted
 * 5. Generate password reset token
 * 6. Set token expiry (1 hour from now)
 * 7. Save token to user
 * 8. Send password reset email
 * 9. Return success message
 *
 * Security Note:
 * Always return success even if email doesn't exist to prevent email enumeration attacks.
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - EmailService: Send password reset email
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { EmailService } from '@infrastructure/services/EmailService.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';
import { ForgotPasswordDto } from '@application/dtos/auth/index.js';
import crypto from 'node:crypto';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Executes the forgot password use case
   * @param dto Email data
   * @returns Result with success message or error
   */
  async execute(dto: ForgotPasswordDto): Promise<Result<string>> {
    // Step 1: Create email value object
    const emailOrError = Email.create(dto.email);
    if (emailOrError.isFailure) {
      return Result.fail<string>(emailOrError.error as string);
    }
    const email = emailOrError.value;

    // Step 2: Find user by email
    const userResult = await this.userRepository.findByEmail(email);
    if (userResult.isFailure) {
      // Return success to prevent email enumeration
      return Result.ok<string>('If an account exists, a password reset email has been sent');
    }

    const user = userResult.value;

    // Step 3: If user not found or deleted, return success (security)
    if (!user || user.isDeleted()) {
      // Don't reveal if user exists or is deleted
      return Result.ok<string>('If an account exists, a password reset email has been sent');
    }

    // Step 4: Generate password reset token
    const resetToken = this.generateResetToken();
    const resetTokenExpiry = this.getResetTokenExpiry(); // 1 hour from now

    // Step 5: Set password reset token on user
    const setTokenResult = user.setPasswordResetToken(resetToken, resetTokenExpiry);
    if (setTokenResult.isFailure) {
      // Log error but don't reveal to user
      console.error('Failed to set reset token:', setTokenResult.error);
      return Result.ok<string>('If an account exists, a password reset email has been sent');
    }

    // Step 6: Save updated user
    const updateResult = await this.userRepository.update(user);
    if (updateResult.isFailure) {
      // Log error but don't reveal to user
      console.error('Failed to save reset token:', updateResult.error);
      return Result.ok<string>('If an account exists, a password reset email has been sent');
    }

    // Step 7: Store reset token in cache (1 hour expiry)
    const cacheKey = `password-reset:${resetToken}`;
    await this.cacheService.set(cacheKey, { userId: user.id, email: user.email.getValue() }, 3600);

    // Step 8: Send password reset email (don't block on this)
    this.sendPasswordResetEmailAsync(user.email.getValue(), user.name, resetToken);

    return Result.ok<string>('If an account exists, a password reset email has been sent');
  }

  /**
   * Generates a cryptographically secure password reset token
   * @returns Reset token
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Gets reset token expiry time (1 hour from now)
   * @returns Expiry date
   */
  private getResetTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry
    return expiry;
  }

  /**
   * Sends password reset email asynchronously (fire and forget)
   * @param email User email
   * @param name User name
   * @param token Reset token
   */
  private sendPasswordResetEmailAsync(email: string, name: string, token: string): void {
    this.emailService
      .sendPasswordResetEmail(email, token, name)
      .then((result) => {
        if (result.isFailure) {
          console.error('Failed to send password reset email:', result.error);
        } else {
          console.log('Password reset email sent successfully to:', email);
        }
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error);
      });
  }
}
