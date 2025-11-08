/**
 * Refresh Token Use Case
 *
 * Business logic for refreshing access tokens using a valid refresh token.
 *
 * Workflow:
 * 1. Validate input (DTO validation)
 * 2. Verify refresh token signature and expiry
 * 3. Find user by userId from token payload
 * 4. Check if user exists and not deleted
 * 5. Validate refresh token matches stored token
 * 6. Check token version (for invalidation support)
 * 7. Generate new access token
 * 8. Optionally rotate refresh token (security best practice)
 * 9. Return new tokens
 *
 * Dependencies:
 * - IUserRepository: User data access
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { Result } from '@shared/types/Result.js';
import { JwtUtil, AccessTokenPayload } from '@shared/utils/jwt.util.js';
import {
  RefreshTokenDto,
  AuthResponseDto,
  UserDataDto,
  TokensDto,
  createAuthResponseDto,
} from '@application/dtos/auth/index.js';

export class RefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Executes the refresh token use case
   * @param dto Refresh token data
   * @returns Result with AuthResponseDto or error
   */
  async execute(dto: RefreshTokenDto): Promise<Result<AuthResponseDto>> {
    // Step 1: Verify refresh token signature and expiry
    const verifyResult = JwtUtil.verifyRefreshToken(dto.refreshToken);
    if (verifyResult.isFailure) {
      return Result.fail<AuthResponseDto>(verifyResult.error as string);
    }

    const decodedToken = verifyResult.value;
    const { userId, tokenVersion } = decodedToken.payload;

    // Step 2: Find user by userId from token
    const userResult = await this.userRepository.findById(userId);
    if (userResult.isFailure) {
      return Result.fail<AuthResponseDto>(userResult.error as string);
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<AuthResponseDto>('User not found');
    }

    // Step 3: Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<AuthResponseDto>('Account has been deleted');
    }

    // Step 4: Validate refresh token matches stored token
    if (user.refreshToken !== dto.refreshToken) {
      return Result.fail<AuthResponseDto>('Invalid refresh token');
    }

    // Step 5: Check token version (for future invalidation support)
    // TODO: Implement token version checking when version field is added to User entity
    // For now, tokenVersion is always 0
    if (tokenVersion !== 0) {
      return Result.fail<AuthResponseDto>('Token has been invalidated');
    }

    // Step 6: Generate new access token
    const accessTokenPayload: AccessTokenPayload = {
      userId: user.id,
      email: user.email.getValue(),
      isVerified: user.isVerified,
    };
    const accessToken = JwtUtil.generateAccessToken(accessTokenPayload);

    // Step 7: Optionally rotate refresh token (security best practice)
    // For now, we'll reuse the same refresh token
    // TODO: Implement refresh token rotation for enhanced security
    const newRefreshToken = dto.refreshToken;

    // Step 8: Create response DTO
    const userDataDto: UserDataDto = {
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    const tokensDto: TokensDto = {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: JwtUtil.getAccessTokenExpiry(),
    };

    const authResponse = createAuthResponseDto(userDataDto, tokensDto);

    return Result.ok<AuthResponseDto>(authResponse);
  }
}
