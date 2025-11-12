/**
 * Register User Use Case
 *
 * Business logic for user registration.
 *
 * Workflow:
 * 1. Validate input (DTO validation)
 * 2. Check if email already exists
 * 3. Create Password and Email value objects
 * 4. Hash password
 * 5. Create User entity with verification token
 * 6. Save user to database
 * 7. Send verification email
 * 8. Generate JWT tokens
 * 9. Return auth response
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - IHashingService: Password hashing
 * - EmailService: Send verification email
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { IHashingService } from '@domain/services/IHashingService.js';
import { EmailService } from '@infrastructure/services/EmailService.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { User } from '@domain/entities/User.entity.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Password } from '@domain/value-objects/Password.vo.js';
import { Result } from '@shared/types/Result.js';
import { JwtUtil, AccessTokenPayload, RefreshTokenPayload } from '@shared/utils/jwt.util.js';
import {
  RegisterDto,
  AuthResponseDto,
  UserDataDto,
  TokensDto,
  createAuthResponseDto,
} from '@application/dtos/auth/index.js';
import crypto from 'node:crypto';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashingService: IHashingService,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Executes the register user use case
   * @param dto Registration data
   * @returns Result with AuthResponseDto or error
   */
  async execute(dto: RegisterDto): Promise<Result<AuthResponseDto>> {
    // Step 1: Check if email already exists
    const emailOrError = Email.create(dto.email);
    if (emailOrError.isFailure) {
      return Result.fail<AuthResponseDto>(emailOrError.error as string);
    }
    const email = emailOrError.value;

    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      return Result.fail<AuthResponseDto>('Email is already registered');
    }

    // Step 2: Create and validate password value object
    const passwordOrError = Password.create(dto.password, true); // requireStrong = true
    if (passwordOrError.isFailure) {
      return Result.fail<AuthResponseDto>(passwordOrError.error as string);
    }
    const password = passwordOrError.value;

    // Step 3: Hash password
    const hashedPasswordResult = await this.hashingService.hashPassword(password);
    if (hashedPasswordResult.isFailure) {
      return Result.fail<AuthResponseDto>(hashedPasswordResult.error as string);
    }
    const hashedPassword = hashedPasswordResult.value;

    // Step 4: Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Step 5: Create user entity
    const userOrError = User.create({
      email,
      hashedPassword: hashedPassword,
      name: dto.name,
      verificationToken,
    });

    if (userOrError.isFailure) {
      return Result.fail<AuthResponseDto>(userOrError.error as string);
    }
    const user = userOrError.value;

    // Step 6: Generate refresh token for the user
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenVersion: 0, // Initial version
    };
    const refreshToken = JwtUtil.generateRefreshToken(refreshTokenPayload);

    // Update user with refresh token
    const setRefreshTokenResult = user.setRefreshToken(refreshToken);
    if (setRefreshTokenResult.isFailure) {
      return Result.fail<AuthResponseDto>(setRefreshTokenResult.error as string);
    }

    // Step 7: Save user to database
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail<AuthResponseDto>(saveResult.error as string);
    }
    const savedUser = saveResult.value;

    // Step 8: Store verification token in cache (24 hours expiry)
    const cacheKey = `email-verification:${verificationToken}`;
    await this.cacheService.set(cacheKey, { userId: savedUser.id, email: savedUser.email.getValue() }, 86400);

    // Step 9: Send verification email (don't block on this)
    this.sendVerificationEmailAsync(savedUser.email.getValue(), savedUser.name, verificationToken);

    // Step 10: Generate JWT tokens
    const accessTokenPayload: AccessTokenPayload = {
      userId: savedUser.id,
      email: savedUser.email.getValue(),
      isVerified: savedUser.isVerified,
    };
    const accessToken = JwtUtil.generateAccessToken(accessTokenPayload);

    // Step 11: Create response DTO
    const userDataDto: UserDataDto = {
      id: savedUser.id,
      email: savedUser.email.getValue(),
      name: savedUser.name,
      isVerified: savedUser.isVerified,
      twoFactorEnabled: savedUser.twoFactorEnabled,
      createdAt: savedUser.createdAt,
    };

    const tokensDto: TokensDto = {
      accessToken,
      refreshToken,
      expiresIn: JwtUtil.getAccessTokenExpiry(),
    };

    const authResponse = createAuthResponseDto(userDataDto, tokensDto);

    return Result.ok<AuthResponseDto>(authResponse);
  }

  /**
   * Generates a cryptographically secure verification token
   * @returns Verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Sends verification email asynchronously (fire and forget)
   * @param email User email
   * @param name User name
   * @param token Verification token
   */
  private sendVerificationEmailAsync(email: string, name: string, token: string): void {
    this.emailService
      .sendVerificationEmail(email, token, name)
      .then((result) => {
        if (result.isFailure) {
          console.error('Failed to send verification email:', result.error);
        } else {
          console.log('Verification email sent successfully to:', email);
        }
      })
      .catch((error) => {
        console.error('Error sending verification email:', error);
      });
  }
}
