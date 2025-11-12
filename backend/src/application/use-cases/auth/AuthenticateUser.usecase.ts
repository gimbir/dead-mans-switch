/**
 * Authenticate User Use Case
 *
 * Business logic for user authentication (login).
 *
 * Workflow:
 * 1. Validate input (DTO validation)
 * 2. Find user by email
 * 3. Check if user exists and not deleted
 * 4. Verify password
 * 5. Generate new JWT tokens
 * 6. Update refresh token in database
 * 7. Return auth response
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - IHashingService: Password verification
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { IHashingService } from '@domain/services/IHashingService.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';
import { JwtUtil, AccessTokenPayload, RefreshTokenPayload } from '@shared/utils/jwt.util.js';
import {
  LoginDto,
  AuthResponseDto,
  UserDataDto,
  TokensDto,
  createAuthResponseDto,
} from '@application/dtos/auth/index.js';

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashingService: IHashingService
  ) {}

  /**
   * Executes the authenticate user use case
   * @param dto Login credentials
   * @returns Result with AuthResponseDto or error
   */
  async execute(dto: LoginDto): Promise<Result<AuthResponseDto>> {
    // Step 1: Create email value object
    const emailOrError = Email.create(dto.email);
    if (emailOrError.isFailure) {
      return Result.fail<AuthResponseDto>(emailOrError.error as string);
    }
    const email = emailOrError.value;

    // Step 2: Find user by email
    const userResult = await this.userRepository.findByEmail(email);
    if (userResult.isFailure) {
      return Result.fail<AuthResponseDto>(userResult.error as string);
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<AuthResponseDto>('Invalid email or password');
    }

    // Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<AuthResponseDto>('Account has been deleted');
    }

    // Step 3: Verify password
    const passwordVerifyResult = await this.hashingService.verifyPassword(
      dto.password,
      user.password
    );

    if (passwordVerifyResult.isFailure) {
      return Result.fail<AuthResponseDto>(passwordVerifyResult.error as string);
    }

    const isPasswordValid = passwordVerifyResult.value;
    if (!isPasswordValid) {
      return Result.fail<AuthResponseDto>('Invalid email or password');
    }

    // Step 4: Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return userId for 2FA verification step
      // Frontend will redirect to 2FA verification page
      return Result.ok<AuthResponseDto>({
        requiresTwoFactor: true,
        userId: user.id,
      } as any); // Type assertion needed for compatibility
    }

    // Step 5: Check if password needs rehashing (security update)
    const needsRehash = await this.hashingService.needsRehash(user.password);
    if (needsRehash) {
      // TODO: Rehash password in a background job or next update
      console.log(`User ${user.id} password needs rehashing`);
    }

    // Step 6: Generate new JWT tokens
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenVersion: 0, // TODO: Implement token versioning for invalidation
    };
    const refreshToken = JwtUtil.generateRefreshToken(refreshTokenPayload);

    // Step 7: Update user with new refresh token
    const setRefreshTokenResult = user.setRefreshToken(refreshToken);
    if (setRefreshTokenResult.isFailure) {
      return Result.fail<AuthResponseDto>(setRefreshTokenResult.error as string);
    }

    // Save updated user
    const updateResult = await this.userRepository.update(user);
    if (updateResult.isFailure) {
      return Result.fail<AuthResponseDto>(updateResult.error as string);
    }

    const updatedUser = updateResult.value;

    // Step 8: Generate access token
    const accessTokenPayload: AccessTokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email.getValue(),
      isVerified: updatedUser.isVerified,
    };
    const accessToken = JwtUtil.generateAccessToken(accessTokenPayload);

    // Step 9: Create response DTO
    const userDataDto: UserDataDto = {
      id: updatedUser.id,
      email: updatedUser.email.getValue(),
      name: updatedUser.name,
      isVerified: updatedUser.isVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
    };

    const tokensDto: TokensDto = {
      accessToken,
      refreshToken,
      expiresIn: JwtUtil.getAccessTokenExpiry(),
    };

    const authResponse = createAuthResponseDto(userDataDto, tokensDto);

    return Result.ok<AuthResponseDto>(authResponse);
  }
}
